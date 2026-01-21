-- ============================================
-- Migration: 012_security_fixes
-- Description: Security fixes from CodeRabbit review
-- ============================================

-- ============================================
-- FIX 1: Add SET search_path to SECURITY DEFINER functions
-- Prevents search_path injection attacks
-- ============================================

-- Fix is_admin() function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

-- Fix is_coordinator() function
CREATE OR REPLACE FUNCTION is_coordinator()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

-- Fix get_dashboard_stats() function
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    RETURN json_build_object(
        'total_registrations', (SELECT COUNT(*) FROM public.registrations WHERE status != 'cancelled'),
        'confirmed_registrations', (SELECT COUNT(*) FROM public.registrations WHERE status = 'confirmed'),
        'pending_payments', (SELECT COUNT(*) FROM public.registrations WHERE status = 'payment_pending'),
        'waitlisted', (SELECT COUNT(*) FROM public.registrations WHERE status = 'waitlist'),
        'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM public.payments WHERE status = 'success'),
        'todays_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM public.payments WHERE status = 'success' AND created_at::date = CURRENT_DATE),
        'active_sports', (SELECT COUNT(*) FROM public.sports WHERE is_registration_open = true AND is_archived = false),
        'total_participants', (SELECT COUNT(DISTINCT participant_id) FROM public.registrations WHERE status = 'confirmed'),
        'colleges_count', (SELECT COUNT(DISTINCT college) FROM public.profiles WHERE id IN (SELECT participant_id FROM public.registrations WHERE status = 'confirmed'))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix get_sport_analytics() function - add admin check
CREATE OR REPLACE FUNCTION get_sport_analytics(p_sport_id UUID)
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    RETURN json_build_object(
        'total_registrations', (SELECT COUNT(*) FROM public.registrations WHERE sport_id = p_sport_id AND status != 'cancelled'),
        'confirmed', (SELECT COUNT(*) FROM public.registrations WHERE sport_id = p_sport_id AND status = 'confirmed'),
        'pending', (SELECT COUNT(*) FROM public.registrations WHERE sport_id = p_sport_id AND status IN ('pending', 'payment_pending')),
        'waitlist', (SELECT COUNT(*) FROM public.registrations WHERE sport_id = p_sport_id AND status = 'waitlist'),
        'cancelled', (SELECT COUNT(*) FROM public.registrations WHERE sport_id = p_sport_id AND status IN ('cancelled', 'withdrawn')),
        'revenue', (SELECT COALESCE(SUM(p.total_amount), 0) FROM public.payments p JOIN public.registrations r ON p.registration_id = r.id WHERE r.sport_id = p_sport_id AND p.status = 'success'),
        'colleges', (SELECT json_agg(DISTINCT pr.college) FROM public.registrations r JOIN public.profiles pr ON r.participant_id = pr.id WHERE r.sport_id = p_sport_id AND r.status = 'confirmed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix get_all_sports_analytics() function
CREATE OR REPLACE FUNCTION get_all_sports_analytics()
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    RETURN (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT 
                s.id,
                s.name,
                s.category,
                s.max_participants,
                s.current_participants,
                s.is_registration_open,
                COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_count,
                COUNT(r.id) FILTER (WHERE r.status = 'waitlist') as waitlist_count,
                COALESCE(SUM(p.total_amount) FILTER (WHERE p.status = 'success'), 0) as revenue
            FROM public.sports s
            LEFT JOIN public.registrations r ON s.id = r.sport_id
            LEFT JOIN public.payments p ON r.id = p.registration_id
            WHERE s.is_archived = false
            GROUP BY s.id
            ORDER BY s.name
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix get_college_analytics() function
CREATE OR REPLACE FUNCTION get_college_analytics()
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    RETURN (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT 
                pr.college,
                COUNT(DISTINCT r.participant_id) as participants,
                COUNT(r.id) as total_registrations,
                COUNT(r.id) FILTER (WHERE r.status = 'confirmed') as confirmed,
                COALESCE(SUM(p.total_amount) FILTER (WHERE p.status = 'success'), 0) as revenue
            FROM public.profiles pr
            JOIN public.registrations r ON pr.id = r.participant_id
            LEFT JOIN public.payments p ON r.id = p.registration_id
            GROUP BY pr.college
            ORDER BY participants DESC
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix get_revenue_analytics() function
CREATE OR REPLACE FUNCTION get_revenue_analytics(p_period TEXT DEFAULT 'daily')
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    IF p_period = 'daily' THEN
        RETURN (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    created_at::date as date,
                    COUNT(*) as transactions,
                    SUM(total_amount) as revenue
                FROM public.payments
                WHERE status = 'success' AND created_at > now() - interval '30 days'
                GROUP BY created_at::date
                ORDER BY date DESC
            ) t
        );
    ELSIF p_period = 'weekly' THEN
        RETURN (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    date_trunc('week', created_at)::date as week_start,
                    COUNT(*) as transactions,
                    SUM(total_amount) as revenue
                FROM public.payments
                WHERE status = 'success' AND created_at > now() - interval '12 weeks'
                GROUP BY date_trunc('week', created_at)
                ORDER BY week_start DESC
            ) t
        );
    ELSE
        RETURN (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    date_trunc('month', created_at)::date as month_start,
                    COUNT(*) as transactions,
                    SUM(total_amount) as revenue
                FROM public.payments
                WHERE status = 'success' AND created_at > now() - interval '12 months'
                GROUP BY date_trunc('month', created_at)
                ORDER BY month_start DESC
            ) t
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix get_registration_trends() function
CREATE OR REPLACE FUNCTION get_registration_trends()
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    RETURN (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT 
                registered_at::date as date,
                COUNT(*) as registrations,
                COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed
            FROM public.registrations
            WHERE registered_at > now() - interval '30 days'
            GROUP BY registered_at::date
            ORDER BY date DESC
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix can_register_for_sport() function
CREATE OR REPLACE FUNCTION can_register_for_sport(p_sport_id UUID, p_user_id UUID)
RETURNS TABLE(can_register BOOLEAN, reason TEXT, waitlist_available BOOLEAN) AS $$
DECLARE
    v_sport RECORD;
    v_existing_reg RECORD;
    v_waitlist_count INTEGER;
BEGIN
    -- Get sport details
    SELECT * INTO v_sport FROM public.sports WHERE id = p_sport_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Sport not found'::TEXT, false;
        RETURN;
    END IF;
    
    IF v_sport.is_archived THEN
        RETURN QUERY SELECT false, 'Sport is archived'::TEXT, false;
        RETURN;
    END IF;
    
    IF NOT v_sport.is_registration_open THEN
        RETURN QUERY SELECT false, 'Registration is closed'::TEXT, false;
        RETURN;
    END IF;
    
    IF now() > v_sport.registration_deadline THEN
        RETURN QUERY SELECT false, 'Registration deadline passed'::TEXT, false;
        RETURN;
    END IF;
    
    IF now() < v_sport.registration_start THEN
        RETURN QUERY SELECT false, 'Registration not yet started'::TEXT, false;
        RETURN;
    END IF;
    
    -- Check existing registration
    SELECT * INTO v_existing_reg FROM public.registrations 
    WHERE participant_id = p_user_id AND sport_id = p_sport_id 
    AND status NOT IN ('cancelled', 'withdrawn');
    
    IF FOUND THEN
        RETURN QUERY SELECT false, 'Already registered for this sport'::TEXT, false;
        RETURN;
    END IF;
    
    -- Check capacity
    IF v_sport.max_participants IS NOT NULL THEN
        IF v_sport.current_participants >= v_sport.max_participants THEN
            IF v_sport.waitlist_enabled THEN
                -- Check waitlist capacity
                SELECT COUNT(*) INTO v_waitlist_count FROM public.registrations 
                WHERE sport_id = p_sport_id AND status = 'waitlist';
                
                IF v_waitlist_count >= v_sport.max_waitlist THEN
                    RETURN QUERY SELECT false, 'Waitlist is full'::TEXT, false;
                ELSE
                    RETURN QUERY SELECT true, 'Waitlist available'::TEXT, true;
                END IF;
            ELSE
                RETURN QUERY SELECT false, 'Sport is full'::TEXT, false;
            END IF;
            RETURN;
        END IF;
    END IF;
    
    RETURN QUERY SELECT true, 'OK'::TEXT, false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Fix promote_from_waitlist() function - add authorization check
-- This function should only be called by triggers or coordinators
CREATE OR REPLACE FUNCTION promote_from_waitlist(p_sport_id UUID)
RETURNS UUID AS $$
DECLARE
    v_next_reg RECORD;
    v_is_trigger_context BOOLEAN;
BEGIN
    -- Check if called from trigger context (OLD/NEW would be available in trigger)
    -- or by a coordinator/admin
    v_is_trigger_context := TG_OP IS NOT NULL;
    
    -- If not trigger context, require coordinator permission
    IF NOT v_is_trigger_context AND NOT is_coordinator() THEN
        RAISE EXCEPTION 'Unauthorized: Only coordinators can promote from waitlist';
    END IF;
    
    SELECT * INTO v_next_reg FROM public.registrations
    WHERE sport_id = p_sport_id AND status = 'waitlist'
    ORDER BY waitlist_position ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    IF FOUND THEN
        UPDATE public.registrations 
        SET status = 'payment_pending', waitlist_position = NULL
        WHERE id = v_next_reg.id;
        
        -- Create notification
        INSERT INTO public.notifications (recipient_id, type, priority, title, message, related_sport_id, related_registration_id)
        VALUES (
            v_next_reg.participant_id,
            'waitlist',
            'high',
            'Spot Available!',
            'A spot has opened up for your waitlisted registration. Please complete payment within 24 hours.',
            p_sport_id,
            v_next_reg.id
        );
        
        RETURN v_next_reg.id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================
-- FIX 2: Add WITH CHECK clause to UPDATE policies
-- Prevents tampering with foreign key fields during updates
-- ============================================

-- Drop and recreate team_members UPDATE policy
DROP POLICY IF EXISTS "Users can update own team members" ON team_members;
CREATE POLICY "Users can update own team members"
    ON team_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.registrations r 
        WHERE r.id = registration_id 
        AND r.participant_id = auth.uid() 
        AND r.status IN ('pending', 'payment_pending')
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.registrations r 
        WHERE r.id = registration_id 
        AND r.participant_id = auth.uid() 
        AND r.status IN ('pending', 'payment_pending')
    ));

-- Drop and recreate notifications UPDATE policy
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ============================================
-- FIX 3: Tighten permissive INSERT policies
-- Restrict to service_role only
-- ============================================

-- Drop and recreate audit_logs INSERT policy
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Drop and recreate notifications INSERT policy
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Drop and recreate receipts storage INSERT policy
DROP POLICY IF EXISTS "System can upload receipts" ON storage.objects;
CREATE POLICY "System can upload receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'receipts' AND (
            auth.role() = 'service_role' OR 
            auth.jwt() ->> 'role' = 'service_role'
        )
    );

-- ============================================
-- FIX 4: Fix race conditions with advisory locks
-- ============================================

-- Fix generate_registration_number() with advisory lock
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    v_sport_code TEXT;
    seq_num INTEGER;
    lock_key BIGINT;
BEGIN
    -- Calculate lock key from sport_id
    lock_key := hashtext('reg_num_' || NEW.sport_id::TEXT);
    
    -- Acquire advisory lock for this sport
    PERFORM pg_advisory_xact_lock(lock_key);
    
    -- Use dedicated sport_code column
    SELECT sport_code INTO v_sport_code FROM public.sports WHERE id = NEW.sport_id;
    
    -- Safe sequence number extraction (regexp to handle non-conforming legacy formats)
    SELECT COALESCE(MAX(CAST(substring(registration_number from '[0-9]{4}$') AS INTEGER)), 0) + 1 
    INTO seq_num 
    FROM public.registrations 
    WHERE sport_id = NEW.sport_id
    AND registration_number ~ ('^REG-' || v_sport_code || '-[0-9]{4}$');
    
    NEW.registration_number := 'REG-' || v_sport_code || '-' || lpad(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Fix generate_receipt_number() with advisory lock
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix TEXT;
    seq_num INTEGER;
    lock_key BIGINT;
BEGIN
    IF NEW.status = 'success' AND NEW.receipt_number IS NULL THEN
        year_suffix := to_char(now(), 'YY');
        
        -- Calculate lock key from year
        lock_key := hashtext('receipt_' || year_suffix);
        
        -- Acquire advisory lock
        PERFORM pg_advisory_xact_lock(lock_key);
        
        SELECT COALESCE(MAX(CAST(right(receipt_number, 6) AS INTEGER)), 0) + 1 
        INTO seq_num 
        FROM public.payments 
        WHERE receipt_number LIKE 'RCP-' || year_suffix || '-%';
        
        NEW.receipt_number := 'RCP-' || year_suffix || '-' || lpad(seq_num::TEXT, 6, '0');
        NEW.completed_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Fix sync_registration_payment_status() with status change guard
CREATE OR REPLACE FUNCTION sync_registration_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status actually changed
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'success' THEN
        UPDATE public.registrations 
        SET payment_status = 'completed',
            status = 'confirmed',
            amount_paid = NEW.total_amount
        WHERE id = NEW.registration_id;
    ELSIF NEW.status = 'failed' THEN
        UPDATE public.registrations 
        SET payment_status = 'failed'
        WHERE id = NEW.registration_id;
    ELSIF NEW.status = 'refunded' THEN
        UPDATE public.registrations 
        SET payment_status = 'refunded',
            status = 'cancelled'
        WHERE id = NEW.registration_id;
    ELSIF NEW.status = 'partially_refunded' THEN
        -- For partial refunds, keep registration active but update amount
        UPDATE public.registrations 
        SET payment_status = 'partially_refunded',
            amount_paid = NEW.total_amount - COALESCE(NEW.refund_amount, 0)
        WHERE id = NEW.registration_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================
-- FIX 5: Add idempotency to reminder job
-- Prevents duplicate reminders
-- ============================================

-- Drop the old cron job and recreate with NOT EXISTS check
-- Wrap in DO block to handle case where job doesn't exist
DO $$
BEGIN
    PERFORM cron.unschedule('send-registration-reminders');
EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, ignore the error
    NULL;
END $$;

SELECT cron.schedule(
    'send-registration-reminders',
    '0 9 * * *',
    $$
    INSERT INTO notifications (recipient_id, type, priority, title, message, related_sport_id, related_registration_id)
    SELECT 
        r.participant_id,
        'reminder',
        'high',
        'Event Starting Soon!',
        'Your registered event ' || s.name || ' starts tomorrow at ' || to_char(s.schedule_start, 'HH24:MI'),
        s.id,
        r.id
    FROM registrations r
    JOIN sports s ON r.sport_id = s.id
    WHERE r.status = 'confirmed'
    AND s.schedule_start::date = CURRENT_DATE + 1
    AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.related_registration_id = r.id
        AND n.type = 'reminder'
        AND n.created_at::date = CURRENT_DATE
    );
    $$
);

-- ============================================
-- FIX 6: Add upper bound constraint on current_participants
-- and fire trigger on INSERT
-- ============================================

-- Update constraint to include upper bound
ALTER TABLE sports DROP CONSTRAINT IF EXISTS valid_capacity;
ALTER TABLE sports ADD CONSTRAINT valid_capacity CHECK (
    current_participants >= 0 AND
    (max_participants IS NULL OR current_participants <= max_participants)
);

-- Drop and recreate trigger to fire on INSERT as well
DROP TRIGGER IF EXISTS check_sports_capacity ON sports;
CREATE TRIGGER check_sports_capacity
    BEFORE INSERT OR UPDATE OF current_participants ON sports
    FOR EACH ROW
    EXECUTE FUNCTION check_registration_capacity();

-- ============================================
-- FIX 7: Prevent non-admin users from changing their own role
-- RLS UPDATE policies cannot reference OLD values, so we use a trigger
-- ============================================

CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is being changed
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        -- Check if user is updating their own profile and is not an admin
        IF auth.uid() = OLD.id AND NOT is_admin() THEN
            RAISE EXCEPTION 'Cannot change own role';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS prevent_role_change ON profiles;
CREATE TRIGGER prevent_role_change
    BEFORE UPDATE OF role ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_self_change();

-- ============================================
-- FIX 8: Atomic waitlist position assignment
-- Prevents race condition in waitlist position allocation
-- ============================================

CREATE OR REPLACE FUNCTION assign_waitlist_position(p_sport_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_position INTEGER;
BEGIN
    -- Acquire advisory lock per sport to serialize waitlist position assignment
    PERFORM pg_advisory_xact_lock(hashtext('waitlist_' || p_sport_id::TEXT));
    
    -- Get next position
    SELECT COALESCE(MAX(waitlist_position), 0) + 1
    INTO v_position
    FROM public.registrations
    WHERE sport_id = p_sport_id AND status = 'waitlist';
    
    RETURN v_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- ============================================
-- FIX 9: Atomic team member replacement
-- Ensures delete-then-insert is transactional
-- ============================================

CREATE OR REPLACE FUNCTION update_team_members(
    p_registration_id UUID,
    p_team_members JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_member JSONB;
    v_index INTEGER := 0;
    v_owner UUID;
BEGIN
    -- Explicit Authorization Check
    SELECT participant_id INTO v_owner FROM public.registrations WHERE id = p_registration_id;
    
    IF v_owner IS NULL THEN
         RAISE EXCEPTION 'Registration not found';
    END IF;
    
    IF v_owner <> auth.uid() AND NOT is_admin() THEN
         RAISE EXCEPTION 'Unauthorized: Cannot update team members for another user';
    END IF;

    -- Lock the registration row to prevent concurrent updates
    PERFORM id FROM public.registrations WHERE id = p_registration_id FOR UPDATE;
    
    -- Delete existing team members
    DELETE FROM public.team_members WHERE registration_id = p_registration_id;
    
    -- Insert new team members
    FOR v_member IN SELECT * FROM jsonb_array_elements(p_team_members)
    LOOP
        v_index := v_index + 1;
        INSERT INTO public.team_members (
            registration_id,
            member_order,
            name,
            email,
            phone,
            is_captain
        ) VALUES (
            p_registration_id,
            v_index,
            v_member->>'name',
            v_member->>'email',
            v_member->>'phone',
            COALESCE((v_member->>'is_captain')::BOOLEAN, false)
        );
    END LOOP;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    -- Transaction will automatically rollback
    RAISE EXCEPTION 'Failed to update team members: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public;
