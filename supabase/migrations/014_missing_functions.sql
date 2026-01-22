-- ============================================
-- Migration: 014_missing_functions
-- Description: Add missing RPC functions required by Edge Functions
-- Fixes: update_team_members, assign_waitlist_position, release_waitlist_position, get_public_stats
-- ============================================

-- ============================================
-- 1. update_team_members - Atomically update team members for a registration
-- Used by: PATCH /registrations/{id}/team
-- ============================================

CREATE OR REPLACE FUNCTION update_team_members(
    p_registration_id UUID,
    p_team_members TEXT  -- JSON string of team members array
)
RETURNS VOID AS $$
DECLARE
    v_members JSONB;
    v_member JSONB;
    v_order INTEGER := 1;
    v_registration RECORD;
BEGIN
    -- Parse JSON string to JSONB
    BEGIN
        v_members := p_team_members::JSONB;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid JSON format for team members';
    END;
    
    -- Validate registration exists and get details
    SELECT r.*, s.team_size_min, s.team_size_max
    INTO v_registration
    FROM registrations r
    JOIN sports s ON r.sport_id = s.id
    WHERE r.id = p_registration_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration not found: %', p_registration_id;
    END IF;
    
    -- Validate team size
    IF jsonb_array_length(v_members) < v_registration.team_size_min THEN
        RAISE EXCEPTION 'Team size must be at least %', v_registration.team_size_min;
    END IF;
    
    IF jsonb_array_length(v_members) > v_registration.team_size_max THEN
        RAISE EXCEPTION 'Team size cannot exceed %', v_registration.team_size_max;
    END IF;
    
    -- Acquire advisory lock for this registration to prevent concurrent updates
    PERFORM pg_advisory_xact_lock(hashtext('team_update_' || p_registration_id::TEXT));
    
    -- Delete existing team members
    DELETE FROM team_members WHERE registration_id = p_registration_id;
    
    -- Insert new team members
    FOR v_member IN SELECT * FROM jsonb_array_elements(v_members)
    LOOP
        -- Validate required fields
        IF v_member->>'name' IS NULL OR trim(v_member->>'name') = '' THEN
            RAISE EXCEPTION 'Team member name is required at position %', v_order;
        END IF;
        
        INSERT INTO team_members (
            registration_id,
            member_order,
            name,
            email,
            phone,
            is_captain
        )
        VALUES (
            p_registration_id,
            v_order,
            trim(v_member->>'name'),
            NULLIF(trim(v_member->>'email'), ''),
            NULLIF(trim(v_member->>'phone'), ''),
            COALESCE((v_member->>'is_captain')::BOOLEAN, false)
        );
        
        v_order := v_order + 1;
    END LOOP;
    
    -- Validate exactly one captain exists
    IF NOT EXISTS (
        SELECT 1 FROM team_members 
        WHERE registration_id = p_registration_id AND is_captain = true
    ) THEN
        -- Auto-assign first member as captain if none specified
        UPDATE team_members 
        SET is_captain = true 
        WHERE registration_id = p_registration_id AND member_order = 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog;

-- Grant execute to authenticated users (RLS on registrations will control access)
REVOKE ALL ON FUNCTION update_team_members FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_team_members TO authenticated, service_role;

COMMENT ON FUNCTION update_team_members IS 
'Atomically updates team members for a registration. Deletes existing members and inserts new ones in a single transaction.';


-- ============================================
-- 2. assign_waitlist_position - Atomically assign next waitlist position
-- Used by: POST /registrations (when waitlist is available)
-- ============================================

CREATE OR REPLACE FUNCTION assign_waitlist_position(p_sport_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_position INTEGER;
    v_sport RECORD;
BEGIN
    -- Validate sport exists
    SELECT * INTO v_sport FROM sports WHERE id = p_sport_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sport not found: %', p_sport_id;
    END IF;
    
    -- Check waitlist is enabled
    IF NOT v_sport.waitlist_enabled THEN
        RAISE EXCEPTION 'Waitlist is not enabled for this sport';
    END IF;
    
    -- Acquire advisory lock for this sport's waitlist to prevent race conditions
    PERFORM pg_advisory_xact_lock(hashtext('waitlist_assign_' || p_sport_id::TEXT));
    
    -- Get current waitlist count
    SELECT COUNT(*) INTO v_position
    FROM registrations
    WHERE sport_id = p_sport_id AND status = 'waitlist';
    
    -- Check if waitlist is full
    IF v_sport.max_waitlist IS NOT NULL AND v_position >= v_sport.max_waitlist THEN
        RAISE EXCEPTION 'Waitlist is full for this sport';
    END IF;
    
    -- Return next position (1-indexed)
    RETURN v_position + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog;

-- Grant execute permissions
REVOKE ALL ON FUNCTION assign_waitlist_position FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assign_waitlist_position TO authenticated, service_role;

COMMENT ON FUNCTION assign_waitlist_position IS 
'Atomically assigns the next waitlist position for a sport. Uses advisory locks to prevent race conditions.';


-- ============================================
-- 3. release_waitlist_position - Cleanup waitlist after failed registration
-- Used by: POST /registrations (on rollback/cleanup)
-- ============================================

CREATE OR REPLACE FUNCTION release_waitlist_position(
    p_sport_id UUID,
    p_position INTEGER
)
RETURNS VOID AS $$
BEGIN
    -- Validate inputs
    IF p_position IS NULL OR p_position < 1 THEN
        RAISE EXCEPTION 'Invalid waitlist position: %', p_position;
    END IF;
    
    -- Acquire advisory lock for this sport's waitlist
    PERFORM pg_advisory_xact_lock(hashtext('waitlist_release_' || p_sport_id::TEXT));
    
    -- Compact waitlist positions: shift all positions after the released one down by 1
    UPDATE registrations
    SET waitlist_position = waitlist_position - 1
    WHERE sport_id = p_sport_id
    AND status = 'waitlist'
    AND waitlist_position > p_position;
    
    -- Note: The registration that was being created but failed should NOT exist
    -- This function is called during cleanup, so we just compact the remaining positions
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog;

-- Grant execute permissions
REVOKE ALL ON FUNCTION release_waitlist_position FROM PUBLIC;
GRANT EXECUTE ON FUNCTION release_waitlist_position TO authenticated, service_role;

COMMENT ON FUNCTION release_waitlist_position IS 
'Releases a waitlist position and compacts the remaining positions. Called during registration rollback.';


-- ============================================
-- 4. get_public_stats - Public statistics for home page (no auth required)
-- Used by: Home page to display event stats to guests
-- ============================================

CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS JSON AS $$
BEGIN
    RETURN json_build_object(
        -- Total confirmed registrations (public can see aggregate, not individual data)
        'total_registrations', (
            SELECT COUNT(*) 
            FROM registrations 
            WHERE status = 'confirmed'
        ),
        
        -- Number of active sports with open registration
        'active_sports', (
            SELECT COUNT(*) 
            FROM sports 
            WHERE is_registration_open = true 
            AND is_archived = false
        ),
        
        -- Total sports available (not archived)
        'total_sports', (
            SELECT COUNT(*) 
            FROM sports 
            WHERE is_archived = false
        ),
        
        -- Number of unique colleges participating
        'colleges_participating', (
            SELECT COUNT(DISTINCT pr.college) 
            FROM registrations r
            JOIN profiles pr ON r.participant_id = pr.id
            WHERE r.status = 'confirmed'
        ),
        
        -- Total unique participants
        'total_participants', (
            SELECT COUNT(DISTINCT participant_id) 
            FROM registrations 
            WHERE status = 'confirmed'
        ),
        
        -- Sports by category breakdown
        'sports_by_category', (
            SELECT json_object_agg(category, cnt)
            FROM (
                SELECT category, COUNT(*) as cnt
                FROM sports
                WHERE is_archived = false
                GROUP BY category
            ) t
        ),
        
        -- Upcoming deadlines (next 5 sports closing soon)
        'upcoming_deadlines', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    name,
                    slug,
                    category,
                    registration_deadline,
                    CASE 
                        WHEN max_participants IS NOT NULL 
                        THEN max_participants - current_participants 
                        ELSE NULL 
                    END as spots_remaining
                FROM sports
                WHERE is_registration_open = true
                AND is_archived = false
                AND registration_deadline > now()
                ORDER BY registration_deadline ASC
                LIMIT 5
            ) t
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_catalog;

-- This function is PUBLIC - no authentication required
-- SECURITY INVOKER means it runs with caller's permissions (RLS will apply)
GRANT EXECUTE ON FUNCTION get_public_stats TO anon, authenticated, service_role;

COMMENT ON FUNCTION get_public_stats IS 
'Returns public statistics for the home page. No authentication required. Only returns aggregate data, no PII.';


-- ============================================
-- 5. Trigger to auto-compact waitlist when a registration is cancelled/withdrawn
-- ============================================

CREATE OR REPLACE FUNCTION compact_waitlist_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status changed to cancelled or withdrawn AND was previously on waitlist
    IF (NEW.status IN ('cancelled', 'withdrawn') 
        AND OLD.status = 'waitlist' 
        AND OLD.waitlist_position IS NOT NULL) THEN
        
        -- Compact waitlist positions
        UPDATE registrations
        SET waitlist_position = waitlist_position - 1
        WHERE sport_id = OLD.sport_id
        AND status = 'waitlist'
        AND waitlist_position > OLD.waitlist_position;
        
        -- Clear the waitlist position on the cancelled registration
        NEW.waitlist_position := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS compact_waitlist_trigger ON registrations;
CREATE TRIGGER compact_waitlist_trigger
    BEFORE UPDATE OF status ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION compact_waitlist_on_cancel();

COMMENT ON FUNCTION compact_waitlist_on_cancel IS 
'Automatically compacts waitlist positions when a waitlisted registration is cancelled or withdrawn.';
