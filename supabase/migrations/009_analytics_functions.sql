-- ============================================
-- Migration: 009_analytics_functions
-- Description: Analytics and dashboard functions
-- ============================================

-- Get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    RETURN json_build_object(
        'total_registrations', (SELECT COUNT(*) FROM registrations WHERE status != 'cancelled'),
        'confirmed_registrations', (SELECT COUNT(*) FROM registrations WHERE status = 'confirmed'),
        'pending_payments', (SELECT COUNT(*) FROM registrations WHERE status = 'payment_pending'),
        'waitlisted', (SELECT COUNT(*) FROM registrations WHERE status = 'waitlist'),
        'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM payments WHERE status = 'success'),
        'todays_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM payments WHERE status = 'success' AND created_at::date = CURRENT_DATE),
        'active_sports', (SELECT COUNT(*) FROM sports WHERE is_registration_open = true AND is_archived = false),
        'total_participants', (SELECT COUNT(DISTINCT participant_id) FROM registrations WHERE status = 'confirmed'),
        'colleges_count', (SELECT COUNT(DISTINCT college) FROM profiles WHERE id IN (SELECT participant_id FROM registrations WHERE status = 'confirmed'))
    );
END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog;

-- Get sport-specific analytics
CREATE OR REPLACE FUNCTION get_sport_analytics(p_sport_id UUID)
RETURNS JSON AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN json_build_object(
        'total_registrations', (SELECT COUNT(*) FROM registrations WHERE sport_id = p_sport_id AND status != 'cancelled'),
        'confirmed', (SELECT COUNT(*) FROM registrations WHERE sport_id = p_sport_id AND status = 'confirmed'),
        'pending', (SELECT COUNT(*) FROM registrations WHERE sport_id = p_sport_id AND status IN ('pending', 'payment_pending')),
        'waitlist', (SELECT COUNT(*) FROM registrations WHERE sport_id = p_sport_id AND status = 'waitlist'),
        'cancelled', (SELECT COUNT(*) FROM registrations WHERE sport_id = p_sport_id AND status IN ('cancelled', 'withdrawn')),
        'revenue', (SELECT COALESCE(SUM(p.total_amount), 0) FROM payments p JOIN registrations r ON p.registration_id = r.id WHERE r.sport_id = p_sport_id AND p.status = 'success'),
        'colleges', (SELECT json_agg(DISTINCT pr.college) FROM registrations r JOIN profiles pr ON r.participant_id = pr.id WHERE r.sport_id = p_sport_id AND r.status = 'confirmed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_catalog;

-- Get all sports analytics
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
            FROM sports s
            LEFT JOIN registrations r ON s.id = r.sport_id
            LEFT JOIN payments p ON r.id = p.registration_id
            WHERE s.is_archived = false
            GROUP BY s.id
            ORDER BY s.name
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get college-wise analytics
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
            FROM profiles pr
            JOIN registrations r ON pr.id = r.participant_id
            LEFT JOIN payments p ON r.id = p.registration_id
            GROUP BY pr.college
            ORDER BY participants DESC
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get revenue analytics
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
                FROM payments
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
                FROM payments
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
                FROM payments
                WHERE status = 'success' AND created_at > now() - interval '12 months'
                GROUP BY date_trunc('month', created_at)
                ORDER BY month_start DESC
            ) t
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get registration trends
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
            FROM registrations
            WHERE registered_at > now() - interval '30 days'
            GROUP BY registered_at::date
            ORDER BY date DESC
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
