// Admin Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createAdminClient,
  corsResponse,
  error,
  success,
  parseBody,
  validateRequired,
  getCurrentUser,
  isAdmin,
  getQueryParams,
  getPagination,
  createAuditLog,
} from "../_shared/utils.ts";

interface BulkUpdateRequest {
  registration_ids: string[];
  status: string;
  reason?: string;
}

interface CollegeRequest {
  name: string;
  short_name?: string;
  city?: string;
}

interface SettingsUpdateRequest {
  [key: string]: unknown;
}

// Escape special characters for LIKE patterns
function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  // All admin endpoints require admin access
  if (!(await isAdmin(req))) {
    return error("Unauthorized", 403);
  }

  const user = await getCurrentUser(req);
  
  // Ensure user is authenticated
  if (!user) {
    return error("Unable to identify user", 401);
  }
  
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const resource = pathParts.length > 1 ? pathParts[1] : null;
  const resourceId = pathParts.length > 2 ? pathParts[2] : null;

  const adminClient = createAdminClient();

  // ============== AUDIT LOGS ==============

  // GET /admin/audit-logs
  if (req.method === "GET" && resource === "audit-logs") {
    try {
      const params = getQueryParams(req);
      const { page, limit, offset } = getPagination(params);
      const userId = params.get("user_id");
      const entityType = params.get("entity_type");
      const action = params.get("action");
      const from = params.get("from");
      const to = params.get("to");

      let query = adminClient
        .from("audit_logs")
        .select("*, user:profiles(name, email)", { count: "exact" })
        .order("created_at", { ascending: false });

      if (userId) query = query.eq("user_id", userId);
      if (entityType) query = query.eq("entity_type", entityType);
      if (action) query = query.eq("action", action);
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      query = query.range(offset, offset + limit - 1);

      const { data: logs, count, error: fetchError } = await query;

      if (fetchError) {
        return error("Failed to fetch audit logs", 500);
      }

      return success({
        logs,
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit,
      });
    } catch (err) {
      console.error("Get audit logs error:", err);
      return error("Failed to get audit logs", 500);
    }
  }

  // ============== COLLEGES ==============

  // GET /admin/colleges
  if (req.method === "GET" && resource === "colleges") {
    try {
      const params = getQueryParams(req);
      const includeInactive = params.get("include_inactive") === "true";

      let query = adminClient.from("colleges").select("*").order("name");

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data: colleges, error: fetchError } = await query;

      if (fetchError) {
        return error("Failed to fetch colleges", 500);
      }

      return success({ colleges });
    } catch (err) {
      console.error("Get colleges error:", err);
      return error("Failed to get colleges", 500);
    }
  }

  // POST /admin/colleges
  if (req.method === "POST" && resource === "colleges" && !resourceId) {
    try {
      const body = await parseBody<CollegeRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["name"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      const { data: college, error: insertError } = await adminClient
        .from("colleges")
        .insert(body)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          return error("College with this name already exists", 409);
        }
        return error("Failed to create college", 500);
      }

      await createAuditLog(adminClient, user.id, "CREATE", "colleges", college.id, null, college, req);

      return success(college, "College created successfully");
    } catch (err) {
      console.error("Create college error:", err);
      return error("Failed to create college", 500);
    }
  }

  // PATCH /admin/colleges/:id
  if (req.method === "PATCH" && resource === "colleges" && resourceId) {
    try {
      const body = await parseBody<Partial<CollegeRequest & { is_active?: boolean }>>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { data: oldCollege, error: fetchError } = await adminClient
        .from("colleges")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (fetchError || !oldCollege) {
        return error("College not found", 404);
      }

      const { data: college, error: updateError } = await adminClient
        .from("colleges")
        .update(body)
        .eq("id", resourceId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to update college", 500);
      }

      await createAuditLog(adminClient, user.id, "UPDATE", "colleges", resourceId, oldCollege, college, req);

      return success(college, "College updated successfully");
    } catch (err) {
      console.error("Update college error:", err);
      return error("Failed to update college", 500);
    }
  }

  // DELETE /admin/colleges/:id
  if (req.method === "DELETE" && resource === "colleges" && resourceId) {
    try {
      // Verify college exists before soft-deleting
      const { data: existing, error: fetchError } = await adminClient
        .from("colleges")
        .select("id")
        .eq("id", resourceId)
        .single();

      if (fetchError || !existing) {
        return error("College not found", 404);
      }

      // Soft delete by setting is_active = false
      const { data: college, error: updateError } = await adminClient
        .from("colleges")
        .update({ is_active: false })
        .eq("id", resourceId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to delete college", 500);
      }

      await createAuditLog(adminClient, user.id, "DELETE", "colleges", resourceId, null, { is_active: false }, req);

      return success(college, "College deleted successfully");
    } catch (err) {
      console.error("Delete college error:", err);
      return error("Failed to delete college", 500);
    }
  }

  // ============== SETTINGS ==============

  // GET /admin/settings
  if (req.method === "GET" && resource === "settings") {
    try {
      const { data: settings, error: fetchError } = await adminClient
        .from("settings")
        .select("*");

      if (fetchError) {
        return error("Failed to fetch settings", 500);
      }

      // Convert array to object
      const settingsObj: Record<string, unknown> = {};
      settings?.forEach((s) => {
        settingsObj[s.key] = s.value;
      });

      return success({ settings: settingsObj });
    } catch (err) {
      console.error("Get settings error:", err);
      return error("Failed to get settings", 500);
    }
  }

  // PATCH /admin/settings
  if (req.method === "PATCH" && resource === "settings") {
    try {
      const body = await parseBody<SettingsUpdateRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const updates = Object.entries(body).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }));

      // Batch upsert all settings at once for atomicity
      const { error: upsertError } = await adminClient
        .from("settings")
        .upsert(updates, { onConflict: "key" });

      if (upsertError) {
        console.error("Settings upsert error:", upsertError);
        return error("Failed to update settings", 500);
      }

      await createAuditLog(adminClient, user.id, "UPDATE", "settings", null, null, body, req);

      return success({ message: "Settings updated successfully" });
    } catch (err) {
      console.error("Update settings error:", err);
      return error("Failed to update settings", 500);
    }
  }

  // ============== REGISTRATIONS (Admin) ==============

  // GET /admin/registrations
  if (req.method === "GET" && resource === "registrations") {
    try {
      const params = getQueryParams(req);
      const { page, limit, offset } = getPagination(params);
      const sportId = params.get("sport_id");
      const status = params.get("status");
      const paymentStatus = params.get("payment_status");
      const college = params.get("college");
      const search = params.get("search");
      const dateFrom = params.get("date_from");
      const dateTo = params.get("date_to");

      let query = adminClient
        .from("registrations")
        .select(
          "*, participant:profiles(name, email, phone, college), sport:sports(name, slug), team_members(*)",
          { count: "exact" }
        )
        .order("registered_at", { ascending: false });

      if (sportId) query = query.eq("sport_id", sportId);
      if (status) query = query.eq("status", status);
      if (paymentStatus) query = query.eq("payment_status", paymentStatus);
      if (dateFrom) query = query.gte("registered_at", dateFrom);
      if (dateTo) query = query.lte("registered_at", dateTo);

      if (college) {
        // Need to filter by participant's college - escape special LIKE characters
        const safeCollege = escapeLikePattern(college);
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("id")
          .ilike("college", `%${safeCollege}%`);
        const profileIds = profiles?.map((p: { id: string }) => p.id) || [];
        if (profileIds.length > 0) {
          query = query.in("participant_id", profileIds);
        } else {
          // No profiles match the college filter - return empty result
          return success({
            registrations: [],
            total: 0,
            page,
            limit,
            has_more: false,
          });
        }
      }

      if (search) {
        // Search by registration number or participant name/email - escape special LIKE characters
        const safeSearch = escapeLikePattern(search);
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("id")
          .or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
        const profileIds = profiles?.map((p) => p.id) || [];
        
        if (profileIds.length > 0) {
          query = query.or(`registration_number.ilike.%${safeSearch}%,participant_id.in.(${profileIds.join(",")})`);
        } else {
          query = query.ilike("registration_number", `%${safeSearch}%`);
        }
      }

      query = query.range(offset, offset + limit - 1);

      const { data: registrations, count, error: fetchError } = await query;

      if (fetchError) {
        return error("Failed to fetch registrations", 500);
      }

      return success({
        registrations,
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit,
      });
    } catch (err) {
      console.error("Get registrations error:", err);
      return error("Failed to get registrations", 500);
    }
  }

  // PATCH /admin/registrations/:id
  if (req.method === "PATCH" && resource === "registrations" && resourceId) {
    try {
      const body = await parseBody<{ status?: string; notes?: string }>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { data: oldReg, error: fetchError } = await adminClient
        .from("registrations")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (fetchError || !oldReg) {
        return error("Registration not found", 404);
      }

      const { data: registration, error: updateError } = await adminClient
        .from("registrations")
        .update(body)
        .eq("id", resourceId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to update registration", 500);
      }

      await createAuditLog(adminClient, user.id, "UPDATE", "registrations", resourceId, oldReg, registration, req);

      return success(registration, "Registration updated successfully");
    } catch (err) {
      console.error("Update registration error:", err);
      return error("Failed to update registration", 500);
    }
  }

  // POST /admin/registrations/bulk-update
  if (req.method === "POST" && resource === "registrations" && resourceId === "bulk-update") {
    try {
      const body = await parseBody<BulkUpdateRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["registration_ids", "status"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      if (body.registration_ids.length === 0) {
        return error("No registration IDs provided");
      }

      const validStatuses = ["pending", "payment_pending", "confirmed", "waitlist", "cancelled", "withdrawn"];
      if (!validStatuses.includes(body.status)) {
        return error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }

      const updateData: Record<string, unknown> = { status: body.status };
      if (body.reason) {
        updateData.withdrawal_reason = body.reason;
      }

      const { data: registrations, error: updateError } = await adminClient
        .from("registrations")
        .update(updateData)
        .in("id", body.registration_ids)
        .select();

      if (updateError) {
        return error("Failed to update registrations", 500);
      }

      await createAuditLog(
        adminClient,
        user.id,
        "BULK_UPDATE",
        "registrations",
        null,
        { ids: body.registration_ids },
        { status: body.status, count: registrations?.length },
        req
      );

      return success({
        updated: registrations?.length || 0,
        message: `${registrations?.length || 0} registrations updated`,
      });
    } catch (err) {
      console.error("Bulk update error:", err);
      return error("Failed to bulk update registrations", 500);
    }
  }

  // GET /admin/registrations/export
  if (req.method === "GET" && resource === "registrations" && resourceId === "export") {
    try {
      const params = getQueryParams(req);
      const sportId = params.get("sport_id");
      const status = params.get("status");
      const format = params.get("format") || "csv";

      let query = adminClient
        .from("registrations")
        .select("*, participant:profiles(name, email, phone, college), sport:sports(name), team_members(name, email, phone)")
        .order("registered_at", { ascending: false });

      if (sportId) query = query.eq("sport_id", sportId);
      if (status) query = query.eq("status", status);

      const { data: registrations, error: fetchError } = await query;

      if (fetchError) {
        return error("Failed to fetch registrations", 500);
      }

      if (format === "csv") {
        // CSV escape function - escape double quotes and wrap in quotes
        const escapeCSV = (value: unknown): string => {
          const str = String(value ?? "");
          // Escape double quotes by doubling them and wrap in quotes
          return `"${str.replace(/"/g, '""')}"`;
        };
        
        // Generate CSV
        const headers = [
          "Registration Number",
          "Participant Name",
          "Email",
          "Phone",
          "College",
          "Sport",
          "Status",
          "Payment Status",
          "Team Name",
          "Team Members",
          "Registered At",
        ];

        const rows = registrations?.map((r) => [
          r.registration_number,
          r.participant?.name || "",
          r.participant?.email || "",
          r.participant?.phone || "",
          r.participant?.college || "",
          r.sport?.name || "",
          r.status,
          r.payment_status,
          r.team_name || "",
          r.team_members?.map((m: { name: string }) => m.name).join("; ") || "",
          r.registered_at,
        ]) || [];

        const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCSV).join(","))].join("\n");

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().split("T")[0]}.csv"`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
          },
        });
      }

      return success({ registrations });
    } catch (err) {
      console.error("Export error:", err);
      return error("Failed to export registrations", 500);
    }
  }

  return error("Not found", 404);
});
