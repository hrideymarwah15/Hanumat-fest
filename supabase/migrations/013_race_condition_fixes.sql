-- Migration: Add indexes and constraints for payment/registration race conditions
-- This migration adds partial unique indexes and RPCs for atomicity

-- ============================================================================
-- PAYMENTS: Partial unique index to prevent duplicate pending payments
-- ============================================================================

-- This index ensures only one pending payment per registration can exist
-- Acts as database-level protection against TOCTOU race conditions
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_pending_registration 
    ON payments(registration_id) 
    WHERE status = 'pending';

-- ============================================================================
-- PAYMENTS: Index on refund_id for deduplication checks
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_payments_refund_id 
    ON payments(refund_id) 
    WHERE refund_id IS NOT NULL;

-- ============================================================================
-- REGISTRATIONS: Atomic registration with team members
-- ============================================================================

-- RPC to atomically create a registration with team members in a single transaction
CREATE OR REPLACE FUNCTION create_registration_with_team(
    p_sport_id UUID,
    p_participant_id UUID,
    p_team_name TEXT DEFAULT NULL,
    p_team_members JSONB DEFAULT '[]'::JSONB,
    p_registration_type TEXT DEFAULT 'individual',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_registration_id UUID;
    v_registration JSONB;
    v_member JSONB;
    v_waitlist_position INT;
    v_sport RECORD;
    v_current_count INT;
BEGIN
    -- Get sport details
    SELECT * INTO v_sport FROM sports WHERE id = p_sport_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sport not found');
    END IF;
    
    -- Check current participants
    SELECT COUNT(*) INTO v_current_count
    FROM registrations
    WHERE sport_id = p_sport_id AND status IN ('confirmed', 'payment_pending');
    
    -- Determine if waitlist applies
    IF v_current_count >= v_sport.max_participants AND v_sport.waitlist_enabled THEN
        -- Get next waitlist position
        SELECT COALESCE(MAX(waitlist_position), 0) + 1 INTO v_waitlist_position
        FROM registrations
        WHERE sport_id = p_sport_id AND waitlist_position IS NOT NULL;
    ELSE
        v_waitlist_position := NULL;
    END IF;
    
    -- Insert registration
    INSERT INTO registrations (
        sport_id,
        participant_id,
        team_name,
        registration_type,
        status,
        waitlist_position,
        notes
    ) VALUES (
        p_sport_id,
        p_participant_id,
        p_team_name,
        p_registration_type,
        CASE WHEN v_waitlist_position IS NOT NULL THEN 'waitlisted' ELSE 'payment_pending' END,
        v_waitlist_position,
        p_notes
    )
    RETURNING id INTO v_registration_id;
    
    -- Insert team members if provided
    IF jsonb_array_length(p_team_members) > 0 THEN
        FOR v_member IN SELECT * FROM jsonb_array_elements(p_team_members)
        LOOP
            INSERT INTO team_members (
                registration_id,
                name,
                email,
                phone,
                college,
                role
            ) VALUES (
                v_registration_id,
                v_member->>'name',
                v_member->>'email',
                v_member->>'phone',
                v_member->>'college',
                COALESCE(v_member->>'role', 'member')
            );
        END LOOP;
    END IF;
    
    -- Return the created registration with team members
    SELECT jsonb_build_object(
        'success', true,
        'registration', row_to_json(r.*),
        'team_members', COALESCE(
            (SELECT jsonb_agg(row_to_json(tm.*)) FROM team_members tm WHERE tm.registration_id = v_registration_id),
            '[]'::JSONB
        )
    ) INTO v_registration
    FROM registrations r
    WHERE r.id = v_registration_id;
    
    RETURN v_registration;
EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'Duplicate registration not allowed');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- REGISTRATIONS: Release waitlist position RPC
-- ============================================================================

-- RPC to release a reserved waitlist position on failure
CREATE OR REPLACE FUNCTION release_waitlist_position(
    p_sport_id UUID,
    p_position INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Decrement positions for registrations after the released position
    UPDATE registrations
    SET waitlist_position = waitlist_position - 1
    WHERE sport_id = p_sport_id 
      AND waitlist_position > p_position
      AND status = 'waitlisted';
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_registration_with_team TO authenticated;
GRANT EXECUTE ON FUNCTION release_waitlist_position TO authenticated;
