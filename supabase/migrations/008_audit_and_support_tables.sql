-- ============================================
-- Migration: 008_audit_and_support_tables
-- Description: Audit logs, colleges, and settings tables
-- ============================================

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- Block direct INSERTs - only the SECURITY DEFINER function can insert
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (false);

-- Secure function to insert audit logs (SECURITY DEFINER bypasses RLS)
-- SET search_path prevents search_path hijacking attacks
CREATE OR REPLACE FUNCTION insert_audit_log(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        request_id
    ) VALUES (
        auth.uid(),
        p_action,
        p_entity_type,
        p_entity_id,
        p_old_values,
        p_new_values,
        p_ip_address,
        p_user_agent,
        p_request_id
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

-- Revoke default public execution access (hardening)
REVOKE ALL ON FUNCTION insert_audit_log FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_audit_log TO authenticated, service_role;

-- Colleges Table
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    short_name TEXT,
    city TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for colleges
CREATE INDEX idx_colleges_name ON colleges(name);
CREATE INDEX idx_colleges_is_active ON colleges(is_active);

-- Enable RLS for colleges
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active colleges"
    ON colleges FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage colleges"
    ON colleges FOR ALL
    USING (is_admin());

-- Settings Table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
    ON settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update settings"
    ON settings FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can insert settings"
    ON settings FOR INSERT
    WITH CHECK (is_admin());

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
    ('registration_enabled', 'true', 'Master switch for all registrations'),
    ('payment_methods', '{"online": true, "offline": true}', 'Enabled payment methods'),
    ('contact_email', '"support@sportsfest.com"', 'Support contact email'),
    ('contact_phone', '"+91-9876543210"', 'Support contact phone'),
    ('event_name', '"Sports Fest 2024"', 'Event name'),
    ('event_dates', '{"start": "2024-03-15", "end": "2024-03-17"}', 'Event dates');
