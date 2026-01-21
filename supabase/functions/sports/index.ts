// Sports Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createUserClient,
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

interface CreateSportRequest {
  name: string;
  category: string;
  description?: string;
  rules?: string;
  is_team_event?: boolean;
  team_size_min?: number;
  team_size_max?: number;
  fees: number;
  early_bird_fees?: number;
  early_bird_deadline?: string;
  registration_start: string;
  registration_deadline: string;
  schedule_start?: string;
  schedule_end?: string;
  venue?: string;
  max_participants?: number;
  waitlist_enabled?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const sportId = pathParts.length > 1 ? pathParts[1] : null;
  const action = pathParts.length > 2 ? pathParts[2] : null;

  // GET /sports - List all sports
  if (req.method === "GET" && !sportId) {
    try {
      const supabase = createUserClient(req);
      const params = getQueryParams(req);
      const { page, limit, offset } = getPagination(params);
      const category = params.get("category");
      const isOpen = params.get("is_open");
      const search = params.get("search");

      let query = supabase
        .from("sports")
        .select("*", { count: "exact" })
        .eq("is_archived", false);

      if (category) {
        query = query.eq("category", category);
      }

      if (isOpen === "true") {
        query = query.eq("is_registration_open", true);
      }

      if (search) {
        // Escape LIKE special characters to prevent wildcard injection
        const escapedSearch = search
          .replace(/\\/g, "\\\\") // Escape backslashes first
          .replace(/%/g, "\\%")   // Escape %
          .replace(/_/g, "\\_");  // Escape _
        query = query.ilike("name", `%${escapedSearch}%`);
      }

      // Validate sort column against whitelist to prevent SQL injection
      const allowedSortColumns = ["registration_deadline", "name", "category", "created_at", "fees"];
      const sortBy = params.get("sort") || "registration_deadline";
      const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "registration_deadline";
      query = query.order(safeSortBy, { ascending: true });
      query = query.range(offset, offset + limit - 1);

      const { data: sports, count, error: fetchError } = await query;

      if (fetchError) {
        return error("Failed to fetch sports", 500);
      }

      return success({
        sports,
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit,
      });
    } catch (err) {
      console.error("List sports error:", err);
      return error("Failed to fetch sports", 500);
    }
  }

  // GET /sports/:id - Get sport details
  if (req.method === "GET" && sportId && !action) {
    try {
      const supabase = createUserClient(req);
      const user = await getCurrentUser(req);

      // Check if sportId is UUID or slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sportId);

      let query = supabase.from("sports").select("*");
      if (isUUID) {
        query = query.eq("id", sportId);
      } else {
        query = query.eq("slug", sportId);
      }

      const { data: sport, error: fetchError } = await query.single();

      if (fetchError || !sport) {
        return error("Sport not found", 404);
      }

      // Get applicable fees
      const { data: feesData, error: feesError } = await supabase.rpc("get_applicable_fees", {
        sport_id: sport.id,
      });

      if (feesError) {
        console.error("Failed to get fees:", feesError);
      }

      // Check if user can register
      let canRegister = false;
      let registerReason = "Not authenticated";
      let waitlistAvailable = false;

      if (user) {
        const { data: eligibility, error: eligibilityError } = await supabase.rpc("can_register_for_sport", {
          p_sport_id: sport.id,
          p_user_id: user.id,
        });

        if (eligibilityError) {
          console.error("Failed to check eligibility:", eligibilityError);
          registerReason = "Error checking eligibility";
        } else if (eligibility && eligibility.length > 0) {
          canRegister = eligibility[0].can_register;
          registerReason = eligibility[0].reason;
          waitlistAvailable = eligibility[0].waitlist_available;
        }
      }

      const spotsRemaining = sport.max_participants
        ? sport.max_participants - sport.current_participants
        : null;

      return success({
        sport,
        applicable_fees: (feesData !== null && feesData !== undefined) ? feesData : sport.fees,
        can_register: canRegister,
        register_reason: registerReason,
        waitlist_available: waitlistAvailable,
        spots_remaining: spotsRemaining,
      });
    } catch (err) {
      console.error("Get sport error:", err);
      return error("Failed to fetch sport", 500);
    }
  }

  // POST /sports - Create sport (admin only)
  if (req.method === "POST" && !sportId) {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      const body = await parseBody<CreateSportRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, [
        "name",
        "category",
        "fees",
        "registration_start",
        "registration_deadline",
      ]);

      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      // Validate category
      const validCategories = ["indoor", "outdoor", "esports", "athletics"];
      if (!validCategories.includes(body.category)) {
        return error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
      }

      // Validate dates
      const regStart = new Date(body.registration_start);
      const regDeadline = new Date(body.registration_deadline);

      // Check for invalid dates
      const isDateInvalid = (d: Date) => isNaN(d.getTime());
      
      if (isDateInvalid(regStart) || isDateInvalid(regDeadline)) {
        return error("Invalid date format for registration dates");
      }

      // Validate early bird deadline if provided
      if (body.early_bird_deadline) {
        const earlyBird = new Date(body.early_bird_deadline);
        if (isDateInvalid(earlyBird)) {
          return error("Invalid date format for early bird deadline");
        }
        if (earlyBird <= regStart || earlyBird >= regDeadline) {
          return error("Early bird deadline must be between registration start and deadline");
        }
      }

      if (regDeadline <= regStart) {
        return error("Registration deadline must be after registration start");
      }

      // Validate user before proceeding
      if (!user) {
        return error("Unable to identify user", 401);
      }

      const adminClient = createAdminClient();
      
      // Explicitly pick allowed fields to prevent mass assignment
      const sportData = {
        name: body.name,
        category: body.category,
        description: body.description,
        rules: body.rules,
        is_team_event: body.is_team_event ?? false,
        team_size_min: body.team_size_min ?? 1,
        team_size_max: body.team_size_max ?? 1,
        fees: body.fees,
        early_bird_fees: body.early_bird_fees,
        early_bird_deadline: body.early_bird_deadline,
        registration_start: body.registration_start,
        registration_deadline: body.registration_deadline,
        schedule_start: body.schedule_start,
        schedule_end: body.schedule_end,
        venue: body.venue,
        max_participants: body.max_participants,
        waitlist_enabled: body.waitlist_enabled ?? true,
        created_by: user.id,
      };
      
      const { data: sport, error: insertError } = await adminClient
        .from("sports")
        .insert(sportData)
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return error("Failed to create sport", 500);
      }

      // Create audit log
      await createAuditLog(
        adminClient,
        user.id,
        "CREATE",
        "sports",
        sport.id,
        null,
        sport,
        req
      );

      return success(sport, "Sport created successfully");
    } catch (err) {
      console.error("Create sport error:", err);
      return error("Failed to create sport", 500);
    }
  }

  // PATCH /sports/:id - Update sport (admin only)
  if (req.method === "PATCH" && sportId && !action) {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return error("Unable to identify user", 401);
      }
      
      const body = await parseBody<Partial<CreateSportRequest>>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const adminClient = createAdminClient();

      // Get old values for audit
      const { data: oldSport, error: fetchError } = await adminClient
        .from("sports")
        .select("*")
        .eq("id", sportId)
        .single();

      if (fetchError || !oldSport) {
        return error("Sport not found", 404);
      }

      // Validate category if provided
      if (body.category) {
        const validCategories = ["indoor", "outdoor", "esports", "athletics"];
        if (!validCategories.includes(body.category)) {
          return error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
        }
      }

      // Validate dates if provided
      const regStart = new Date(body.registration_start ?? oldSport.registration_start);
      const regDeadline = new Date(body.registration_deadline ?? oldSport.registration_deadline);
      
      if (isNaN(regStart.getTime()) || isNaN(regDeadline.getTime())) {
        return error("Invalid date format for registration dates");
      }

      // Validate early bird deadline if provided or updating related dates
      if (body.early_bird_deadline || (oldSport.early_bird_deadline && (body.registration_start || body.registration_deadline))) {
        const earlyBird = new Date(body.early_bird_deadline ?? oldSport.early_bird_deadline);
        if (isNaN(earlyBird.getTime())) {
          return error("Invalid date format for early bird deadline");
        }
        if (earlyBird <= regStart || earlyBird >= regDeadline) {
          return error("Early bird deadline must be between registration start and deadline");
        }
      }
      
      if (regDeadline <= regStart) {
        return error("Registration deadline must be after registration start");
      }

      // Whitelist allowed updatable fields to prevent mass-assignment
      // Protected fields: id, created_at, created_by, is_archived, current_participants, slug
      const allowedUpdate: Record<string, unknown> = {};
      const allowedFields = [
        "name",
        "category", 
        "description",
        "rules",
        "is_team_event",
        "team_size_min",
        "team_size_max",
        "fees",
        "early_bird_fees",
        "early_bird_deadline",
        "registration_start",
        "registration_deadline",
        "schedule_start",
        "schedule_end",
        "venue",
        "max_participants",
        "waitlist_enabled",
        "is_registration_open",
      ];

      for (const field of allowedFields) {
        if (field in body && body[field as keyof typeof body] !== undefined) {
          allowedUpdate[field] = body[field as keyof typeof body];
        }
      }

      if (Object.keys(allowedUpdate).length === 0) {
        return error("No valid fields to update");
      }

      const { data: sport, error: updateError } = await adminClient
        .from("sports")
        .update(allowedUpdate)
        .eq("id", sportId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to update sport", 500);
      }

      await createAuditLog(
        adminClient,
        user.id,
        "UPDATE",
        "sports",
        sportId,
        oldSport,
        sport,
        req
      );

      return success(sport, "Sport updated successfully");
    } catch (err) {
      console.error("Update sport error:", err);
      return error("Failed to update sport", 500);
    }
  }

  // POST /sports/:id/toggle-registration - Toggle registration (admin only)
  if (req.method === "POST" && sportId && action === "toggle-registration") {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return error("Unable to identify user", 401);
      }

      const adminClient = createAdminClient();

      const { data: sport } = await adminClient
        .from("sports")
        .select("*")
        .eq("id", sportId)
        .single();

      if (!sport) {
        return error("Sport not found", 404);
      }

      const newStatus = !sport.is_registration_open;

      // If opening, check deadline hasn't passed
      if (newStatus && new Date(sport.registration_deadline) < new Date()) {
        return error("Cannot open registration after deadline has passed");
      }

      const { data: updatedSport, error: updateError } = await adminClient
        .from("sports")
        .update({ is_registration_open: newStatus })
        .eq("id", sportId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to update sport", 500);
      }

      await createAuditLog(
        adminClient,
        user.id,
        newStatus ? "OPEN_REGISTRATION" : "CLOSE_REGISTRATION",
        "sports",
        sportId,
        { is_registration_open: sport.is_registration_open },
        { is_registration_open: newStatus },
        req
      );

      return success(updatedSport, `Registration ${newStatus ? "opened" : "closed"} successfully`);
    } catch (err) {
      console.error("Toggle registration error:", err);
      return error("Failed to toggle registration", 500);
    }
  }

  // POST /sports/:id/duplicate - Duplicate sport (admin only)
  if (req.method === "POST" && sportId && action === "duplicate") {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return error("Unable to identify user", 401);
      }

      const adminClient = createAdminClient();

      const { data: originalSport } = await adminClient
        .from("sports")
        .select("*")
        .eq("id", sportId)
        .single();

      if (!originalSport) {
        return error("Sport not found", 404);
      }

      // Create duplicate with reset values
      const duplicateData = {
        name: `${originalSport.name} (Copy)`,
        category: originalSport.category,
        description: originalSport.description,
        rules: originalSport.rules,
        is_team_event: originalSport.is_team_event,
        team_size_min: originalSport.team_size_min,
        team_size_max: originalSport.team_size_max,
        fees: originalSport.fees,
        early_bird_fees: originalSport.early_bird_fees,
        venue: originalSport.venue,
        max_participants: originalSport.max_participants,
        waitlist_enabled: originalSport.waitlist_enabled,
        max_waitlist: originalSport.max_waitlist,
        is_registration_open: false,
        current_participants: 0,
        created_by: user.id,
        // Dates need to be updated manually
        registration_start: originalSport.registration_start,
        registration_deadline: originalSport.registration_deadline,
      };

      const { data: newSport, error: insertError } = await adminClient
        .from("sports")
        .insert(duplicateData)
        .select()
        .single();

      if (insertError) {
        return error("Failed to duplicate sport", 500);
      }

      await createAuditLog(
        adminClient,
        user.id,
        "DUPLICATE",
        "sports",
        newSport.id,
        { original_id: sportId },
        newSport,
        req
      );

      return success(newSport, "Sport duplicated successfully");
    } catch (err) {
      console.error("Duplicate sport error:", err);
      return error("Failed to duplicate sport", 500);
    }
  }

  // POST /sports/:id/archive - Archive sport (admin only)
  if (req.method === "POST" && sportId && action === "archive") {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      
      if (!user) {
        return error("Unable to identify user", 401);
      }
      
      const adminClient = createAdminClient();

      // First check if sport exists
      const { data: existingSport, error: fetchError } = await adminClient
        .from("sports")
        .select("id")
        .eq("id", sportId)
        .single();

      if (fetchError || !existingSport) {
        return error("Sport not found", 404);
      }

      // Now perform the update
      const { data: sport, error: updateError } = await adminClient
        .from("sports")
        .update({ is_archived: true, is_registration_open: false })
        .eq("id", sportId)
        .select()
        .single();

      if (updateError || !sport) {
        return error("Failed to archive sport", 500);
      }

      await createAuditLog(
        adminClient,
        user.id,
        "ARCHIVE",
        "sports",
        sportId,
        null,
        { is_archived: true },
        req
      );

      return success(sport, "Sport archived successfully");
    } catch (err) {
      console.error("Archive sport error:", err);
      return error("Failed to archive sport", 500);
    }
  }

  return error("Not found", 404);
});
