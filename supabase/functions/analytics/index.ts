// Analytics Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createAdminClient,
  corsResponse,
  error,
  success,
  isAdmin,
  getQueryParams,
} from "../_shared/utils.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const action = pathParts.length > 1 ? pathParts[1] : null;

  const adminClient = createAdminClient();

  // ============================================
  // PUBLIC ENDPOINT - No authentication required
  // GET /analytics/public-stats - Public statistics for home page
  // ============================================
  if (req.method === "GET" && action === "public-stats") {
    try {
      const { data: stats, error: rpcError } = await adminClient.rpc("get_public_stats");

      if (rpcError) {
        console.error("Failed to get public stats:", rpcError);
        return error("Failed to get statistics", 500);
      }

      return success(stats);
    } catch (err) {
      console.error("Public stats error:", err);
      return error("Failed to get statistics", 500);
    }
  }

  // ============================================
  // ADMIN ENDPOINTS - Require admin authentication
  // ============================================
  if (!(await isAdmin(req))) {
    return error("Unauthorized", 403);
  }

  // GET /analytics/dashboard - Dashboard stats
  if (req.method === "GET" && action === "dashboard") {
    try {
      // Get dashboard stats
      const { data: stats, error: rpcError } = await adminClient.rpc("get_dashboard_stats");

      if (rpcError) {
        return error("Failed to get stats", 500);
      }

      // Get recent registrations
      const { data: recentRegistrations, error: regError } = await adminClient
        .from("registrations")
        .select("*, participant:profiles(name, email, college), sport:sports(name)")
        .order("registered_at", { ascending: false })
        .limit(10);

      if (regError) {
        console.error("Failed to fetch recent registrations:", regError);
        return error("Failed to fetch recent registrations", 500);
      }

      // Get recent payments
      const { data: recentPayments, error: payError } = await adminClient
        .from("payments")
        .select("*, user:profiles(name, email), registration:registrations(registration_number, sport:sports(name))")
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(10);

      if (payError) {
        console.error("Failed to fetch recent payments:", payError);
        return error("Failed to fetch recent payments", 500);
      }

      return success({
        stats,
        recent_registrations: recentRegistrations || [],
        recent_payments: recentPayments || [],
      });
    } catch (err) {
      console.error("Dashboard stats error:", err);
      return error("Failed to get dashboard stats", 500);
    }
  }

  // GET /analytics/sports - Sport-wise analytics
  if (req.method === "GET" && action === "sports") {
    try {
      const { data: sports, error: rpcError } = await adminClient.rpc("get_all_sports_analytics");

      if (rpcError) {
        return error("Failed to get sports analytics", 500);
      }

      return success({ sports: sports || [] });
    } catch (err) {
      console.error("Sports analytics error:", err);
      return error("Failed to get sports analytics", 500);
    }
  }

  // GET /analytics/colleges - College-wise analytics
  if (req.method === "GET" && action === "colleges") {
    try {
      const { data: colleges, error: rpcError } = await adminClient.rpc("get_college_analytics");

      if (rpcError) {
        return error("Failed to get college analytics", 500);
      }

      return success({ colleges: colleges || [] });
    } catch (err) {
      console.error("College analytics error:", err);
      return error("Failed to get college analytics", 500);
    }
  }

  // GET /analytics/revenue - Revenue analytics
  if (req.method === "GET" && action === "revenue") {
    try {
      const params = getQueryParams(req);
      const periodParam = params.get("period") || "daily";
      
      // Validate period parameter
      const allowedPeriods = ["daily", "weekly", "monthly"];
      const period = allowedPeriods.includes(periodParam) ? periodParam : "daily";

      const { data: revenue, error: rpcError } = await adminClient.rpc("get_revenue_analytics", {
        p_period: period,
      });

      if (rpcError) {
        return error("Failed to get revenue analytics", 500);
      }

      // Calculate totals
      let totalRevenue = 0;
      let totalTransactions = 0;

      if (revenue) {
        revenue.forEach((item: { revenue: number; transactions: number }) => {
          totalRevenue += Number(item.revenue) || 0;
          totalTransactions += item.transactions || 0;
        });
      }

      return success({
        revenue: revenue || [],
        summary: {
          total_revenue: totalRevenue,
          total_transactions: totalTransactions,
          period,
        },
      });
    } catch (err) {
      console.error("Revenue analytics error:", err);
      return error("Failed to get revenue analytics", 500);
    }
  }

  // GET /analytics/trends - Registration trends
  if (req.method === "GET" && action === "trends") {
    try {
      const { data: trends, error: rpcError } = await adminClient.rpc("get_registration_trends");

      if (rpcError) {
        return error("Failed to get trends", 500);
      }

      return success({ trends: trends || [] });
    } catch (err) {
      console.error("Trends error:", err);
      return error("Failed to get trends", 500);
    }
  }

  // GET /analytics/sport/:id - Single sport analytics
  if (req.method === "GET" && action === "sport" && pathParts.length > 2) {
    try {
      const sportId = pathParts[2];
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(sportId)) {
        return error("Invalid sport ID format", 400);
      }

      const { data: sportAnalytics, error: rpcError } = await adminClient.rpc("get_sport_analytics", {
        p_sport_id: sportId,
      });

      if (rpcError) {
        return error("Failed to get sport analytics", 500);
      }

      // Get registrations breakdown by status
      const { data: registrations, error: regError } = await adminClient
        .from("registrations")
        .select("status, participant:profiles(college)")
        .eq("sport_id", sportId);

      if (regError) {
        console.error(`Failed to fetch registrations for sport ${sportId}:`, regError);
        return error("Failed to fetch sport registrations", 500);
      }

      // Group by college
      const collegeBreakdown: Record<string, number> = {};
      registrations?.forEach((reg: { status: string; participant: { college: string } | null }) => {
        const college = reg.participant?.college || "Unknown";
        collegeBreakdown[college] = (collegeBreakdown[college] || 0) + 1;
      });

      return success({
        analytics: sportAnalytics,
        college_breakdown: collegeBreakdown,
      });
    } catch (err) {
      console.error("Sport analytics error:", err);
      return error("Failed to get sport analytics", 500);
    }
  }

  return error("Not found", 404);
});
