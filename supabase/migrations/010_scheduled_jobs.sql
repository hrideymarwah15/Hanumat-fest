-- ============================================
-- Migration: 010_scheduled_jobs
-- Description: pg_cron scheduled jobs
-- ============================================

-- Auto-close expired registrations (every 15 minutes)
SELECT cron.schedule(
    'auto-close-expired-registrations',
    '*/15 * * * *',
    $$
    UPDATE sports 
    SET is_registration_open = false 
    WHERE is_registration_open = true 
    AND registration_deadline < now();
    $$
);

-- Auto-open registrations when start time arrives (every 15 minutes)
SELECT cron.schedule(
    'auto-open-registrations',
    '*/15 * * * *',
    $$
    UPDATE sports 
    SET is_registration_open = true 
    WHERE is_registration_open = false 
    AND registration_start <= now() 
    AND registration_deadline > now()
    AND is_archived = false
    AND (max_participants IS NULL OR current_participants < max_participants);
    $$
);

-- Expire pending payments after 24 hours (every hour)
SELECT cron.schedule(
    'expire-pending-payments',
    '0 * * * *',
    $$
    UPDATE registrations 
    SET status = 'cancelled', 
        withdrawal_reason = 'Payment timeout (24 hours)'
    WHERE status = 'payment_pending' 
    AND updated_at < now() - interval '24 hours';
    $$
);

-- Cleanup expired notifications (daily at midnight)
SELECT cron.schedule(
    'cleanup-expired-notifications',
    '0 0 * * *',
    $$
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < now();
    $$
);

-- Send registration reminders for events starting next day (daily at 9 AM)
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
    AND s.schedule_start::date = CURRENT_DATE + 1;
    $$
);
