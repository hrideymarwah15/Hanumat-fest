-- ============================================
-- Migration: 005_team_members_table
-- Description: Team members table
-- ============================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    member_order INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_captain BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT unique_member_order UNIQUE (registration_id, member_order),
    CONSTRAINT unique_member_email UNIQUE (registration_id, email)
);

-- Indexes
CREATE INDEX idx_team_members_registration_id ON team_members(registration_id);
CREATE INDEX idx_team_members_email ON team_members(email);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own team members"
    ON team_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM registrations r 
        WHERE r.id = registration_id AND r.participant_id = auth.uid()
    ));

CREATE POLICY "Users can insert own team members"
    ON team_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM registrations r 
        WHERE r.id = registration_id 
        AND r.participant_id = auth.uid() 
        AND r.status IN ('pending', 'payment_pending')
    ));

CREATE POLICY "Users can update own team members"
    ON team_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM registrations r 
        WHERE r.id = registration_id 
        AND r.participant_id = auth.uid() 
        AND r.status IN ('pending', 'payment_pending')
    ))
    WITH CHECK (
        -- Ensure new registration_id still belongs to the user and is editable
        EXISTS (
            SELECT 1 FROM registrations r 
            WHERE r.id = registration_id 
            AND r.participant_id = auth.uid() 
            AND r.status IN ('pending', 'payment_pending')
        )
        -- member_order uniqueness is enforced by the unique_member_order constraint
    );

CREATE POLICY "Users can delete own team members"
    ON team_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM registrations r 
        WHERE r.id = registration_id 
        AND r.participant_id = auth.uid() 
        AND r.status IN ('pending', 'payment_pending')
    ));

CREATE POLICY "Admins can view all team members"
    ON team_members FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage all team members"
    ON team_members FOR ALL
    USING (is_admin());
