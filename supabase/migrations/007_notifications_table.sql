-- ============================================
-- Migration: 007_notifications_table
-- Description: Notifications table
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('registration', 'payment', 'announcement', 'reminder', 'waitlist', 'cancellation')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMPTZ,
    related_sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    related_registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    metadata JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- Block direct INSERTs - only service_role or SECURITY DEFINER function can insert
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Secure function to create notifications (SECURITY DEFINER bypasses RLS)
-- SET search_path prevents search_path hijacking attacks
CREATE OR REPLACE FUNCTION create_notification(
    p_recipient_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_priority TEXT DEFAULT 'normal',
    p_action_url TEXT DEFAULT NULL,
    p_related_sport_id UUID DEFAULT NULL,
    p_related_registration_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    validated_action_url TEXT;
BEGIN
    -- Validate recipient exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_recipient_id) THEN
        RAISE EXCEPTION 'Invalid recipient_id: user does not exist';
    END IF;
    
    -- Validate and sanitize action_url (must be relative or same-origin)
    IF p_action_url IS NOT NULL AND p_action_url != '' THEN
        -- Only allow relative URLs starting with / (relaxed regex)
        IF NOT (p_action_url ~ '^/[a-zA-Z0-9/_\-\?\=\&\#\.\%\+\~\:]*$') THEN
            RAISE WARNING 'Invalid action_url rejected: %', p_action_url;
            validated_action_url := NULL; -- Reject invalid URLs
        ELSE
            validated_action_url := p_action_url;
        END IF;
    ELSE
        validated_action_url := NULL;
    END IF;
    
    INSERT INTO public.notifications (
        recipient_id,
        type,
        title,
        message,
        priority,
        action_url,
        related_sport_id,
        related_registration_id,
        metadata,
        expires_at
    ) VALUES (
        p_recipient_id,
        p_type,
        p_title,
        p_message,
        p_priority,
        validated_action_url,
        p_related_sport_id,
        p_related_registration_id,
        p_metadata,
        p_expires_at
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public;

CREATE POLICY "Admins can manage all notifications"
    ON notifications FOR ALL
    USING (is_admin());

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
