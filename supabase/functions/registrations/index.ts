// Registration Edge Functions
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
import { sendEmail, getRegistrationConfirmationHtml } from "../_shared/email.ts";

interface TeamMember {
  name: string;
  email?: string;
  phone?: string;
  is_captain?: boolean;
}

interface RegisterRequest {
  sport_id: string;
  is_team?: boolean;
  team_name?: string;
  team_members?: TeamMember[];
}

interface CancelRequest {
  reason?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const registrationId = pathParts.length > 1 ? pathParts[1] : null;
  const action = pathParts.length > 2 ? pathParts[2] : null;

  // GET /registrations/check/:sport_id - Check eligibility
  if (req.method === "GET" && registrationId === "check" && action) {
    const sportId = action;
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const supabase = createUserClient(req);

    const { data: eligibility, error: rpcError } = await supabase.rpc(
      "can_register_for_sport",
      { p_sport_id: sportId, p_user_id: user.id }
    );

    if (rpcError) {
      return error("Failed to check eligibility", 500);
    }

    const result = eligibility?.[0] || {
      can_register: false,
      reason: "Unknown error",
      waitlist_available: false,
    };

    // Get applicable fees
    const { data: fees, error: feesError } = await supabase.rpc("get_applicable_fees", {
      sport_id: sportId,
    });
    if (feesError) {
      console.error("Failed to fetch fees:", feesError);
    }

    // Get spots remaining
    const { data: sport, error: sportError } = await supabase
      .from("sports")
      .select("max_participants, current_participants")
      .eq("id", sportId)
      .single();
    if (sportError) {
      console.error("Failed to fetch sport:", sportError);
    }

    // Guard against NaN in spotsRemaining calculation
    const spotsRemaining = sport?.max_participants != null && sport?.current_participants != null
      ? sport.max_participants - sport.current_participants
      : null;

    return success({
      can_register: result.can_register,
      reason: result.reason,
      waitlist_available: result.waitlist_available,
      applicable_fees: fees,
      spots_remaining: spotsRemaining,
    });
  }

  // GET /registrations/me - Get user's registrations
  if (req.method === "GET" && registrationId === "me") {
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const supabase = createUserClient(req);
    const params = getQueryParams(req);
    const status = params.get("status");
    const includePast = params.get("include_past") === "true";

    let query = supabase
      .from("registrations")
      .select(`
        *,
        sport:sports(*),
        team_members(*),
        payments(*)
      `)
      .eq("participant_id", user.id)
      .order("registered_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (!includePast) {
      query = query.neq("status", "cancelled").neq("status", "withdrawn");
    }

    const { data: registrations, error: fetchError } = await query;

    if (fetchError) {
      return error("Failed to fetch registrations", 500);
    }

    return success({ registrations });
  }

  // GET /registrations/:id - Get single registration
  if (req.method === "GET" && registrationId && registrationId !== "me" && registrationId !== "check" && !action) {
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const supabase = createUserClient(req);

    const { data: registration, error: fetchError } = await supabase
      .from("registrations")
      .select(`
        *,
        sport:sports(*),
        team_members(*),
        payments(*)
      `)
      .eq("id", registrationId)
      .single();

    if (fetchError || !registration) {
      return error("Registration not found", 404);
    }

    // Check access
    const isOwner = registration.participant_id === user.id;
    const userIsAdmin = user.role === "admin";

    if (!isOwner && !userIsAdmin) {
      return error("Unauthorized", 403);
    }

    return success({ registration });
  }

  // POST /registrations - Create registration
  if (req.method === "POST" && !registrationId) {
    try {
      const user = await getCurrentUser(req);

      if (!user) {
        return error("Unauthorized", 401);
      }

      const body = await parseBody<RegisterRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["sport_id"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      const supabase = createUserClient(req);
      const adminClient = createAdminClient();

      // Check eligibility
      const { data: eligibility, error: rpcError } = await supabase.rpc("can_register_for_sport", {
        p_sport_id: body.sport_id,
        p_user_id: user.id,
      });

      if (rpcError) {
        console.error("Eligibility check failed:", rpcError);
        return error("Failed to check eligibility", 500);
      }

      const eligResult = eligibility?.[0];
      if (!eligResult?.can_register) {
        return error(eligResult?.reason || "Cannot register for this sport", 403);
      }

      // Get sport details
      const { data: sport } = await supabase
        .from("sports")
        .select("*")
        .eq("id", body.sport_id)
        .single();

      if (!sport) {
        return error("Sport not found", 404);
      }

      // Validate team if team event
      if (sport.is_team_event) {
        if (!body.team_name) {
          return error("Team name is required for team events");
        }

        if (!body.team_members || body.team_members.length === 0) {
          return error("Team members are required for team events");
        }

        if (
          body.team_members.length < sport.team_size_min ||
          body.team_members.length > sport.team_size_max
        ) {
          return error(
            `Team size must be between ${sport.team_size_min} and ${sport.team_size_max}`
          );
        }
      }

      // Determine initial status
      let initialStatus = "payment_pending";
      let waitlistPosition = null;

      if (eligResult.waitlist_available) {
        initialStatus = "waitlist";
        // Get next waitlist position atomically using RPC function with advisory lock
        const { data: position, error: posError } = await adminClient.rpc(
          "assign_waitlist_position",
          { p_sport_id: body.sport_id }
        );
        if (posError) {
          console.error("Failed to assign waitlist position:", posError);
          return error("Failed to assign waitlist position", 500);
        }
        waitlistPosition = position;
      }

      // Create registration with cleanup on failure
      let registration;
      try {
        const { data: regData, error: insertError } = await adminClient
          .from("registrations")
          .insert({
            participant_id: user.id,
            sport_id: body.sport_id,
            status: initialStatus,
            is_team: sport.is_team_event || body.is_team || false,
            team_name: body.team_name,
            waitlist_position: waitlistPosition,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        registration = regData;

        // Add team members if team event
        if ((sport.is_team_event || body.is_team) && body.team_members && body.team_members.length > 0) {
          const teamMembersData = body.team_members.map((member, index) => ({
            registration_id: registration.id,
            member_order: index + 1,
            name: member.name,
            email: member.email,
            phone: member.phone,
            is_captain: member.is_captain || false,
          }));

          const { error: teamError } = await adminClient.from("team_members").insert(teamMembersData);
          
          if (teamError) {
            console.error("Team members insert error:", teamError);
            // Rollback registration on team insert failure
            const { error: rollbackError } = await adminClient.from("registrations").delete().eq("id", registration.id);
            if (rollbackError) {
                console.error("Failed to rollback registration after team insert error:", rollbackError);
            }
            throw teamError;
          }
        }
      } catch (err) {
        console.error("Registration process failed:", err);
        
        // Cleanup waitlist if assigned
        if (waitlistPosition !== null) {
          const { error: rpcError } = await adminClient.rpc("release_waitlist_position", {
            p_sport_id: body.sport_id,
            p_position: waitlistPosition
          });
          if (rpcError) {
             console.error(`Failed to release waitlist position (Sport: ${body.sport_id}, Pos: ${waitlistPosition}):`, rpcError);
          }
        }
        throw err;
      }

      // Create notification
      const { error: notifError } = await adminClient.from("notifications").insert({
        recipient_id: user.id,
        type: "registration",
        title: eligResult.waitlist_available
          ? "Added to Waitlist"
          : "Registration Created",
        message: eligResult.waitlist_available
          ? `You are #${waitlistPosition} on the waitlist for ${sport.name}`
          : `Registration created for ${sport.name}. Please complete payment.`,
        related_sport_id: sport.id,
        related_registration_id: registration.id,
      });
      if (notifError) {
        console.error("Failed to create registration notification:", notifError);
      }

      // Send email
      sendEmail({
        to: user.email,
        subject: eligResult.waitlist_available
          ? `Waitlisted for ${sport.name}`
          : `Registration for ${sport.name}`,
        html: getRegistrationConfirmationHtml(
          user.name,
          sport.name,
          registration.registration_number,
          eligResult.waitlist_available
        ),
      }).catch(console.error);

      // Get applicable fees
      const { data: fees } = await supabase.rpc("get_applicable_fees", {
        sport_id: body.sport_id,
      });

      return success(
        {
          registration,
          status: initialStatus,
          amount: fees,
          waitlist_position: waitlistPosition,
        },
        initialStatus === "waitlist"
          ? "Added to waitlist"
          : "Registration created. Please complete payment."
      );
    } catch (err) {
      console.error("Create registration error:", err);
      return error("Failed to create registration", 500);
    }
  }

  // PATCH /registrations/:id/team - Update team members
  if (req.method === "PATCH" && registrationId && action === "team") {
    try {
      const user = await getCurrentUser(req);

      if (!user) {
        return error("Unauthorized", 401);
      }

      const supabase = createUserClient(req);
      const adminClient = createAdminClient();

      // Get registration
      const { data: registration } = await supabase
        .from("registrations")
        .select("*, sport:sports(*)")
        .eq("id", registrationId)
        .single();

      if (!registration) {
        return error("Registration not found", 404);
      }

      if (registration.participant_id !== user.id) {
        return error("Unauthorized", 403);
      }

      if (!["pending", "payment_pending"].includes(registration.status)) {
        return error("Cannot update team after payment is completed");
      }

      const body = await parseBody<{ team_name?: string; team_members?: TeamMember[] }>(req);
      if (!body) {
        return error("Invalid request body");
      }

      // Update team name if provided
      if (body.team_name) {
        const { error: updateError } = await adminClient
          .from("registrations")
          .update({ team_name: body.team_name })
          .eq("id", registrationId);
        if (updateError) {
          console.error("Failed to update team name:", updateError);
          return error("Failed to update team name", 500);
        }
      }

      // Update team members if provided
      if (body.team_members) {
        const sport = registration.sport;

        if (
          body.team_members.length < sport.team_size_min ||
          body.team_members.length > sport.team_size_max
        ) {
          return error(
            `Team size must be between ${sport.team_size_min} and ${sport.team_size_max}`
          );
        }

        // Use atomic RPC function to update team members transactionally
        const { error: updateMembersError } = await adminClient.rpc(
          "update_team_members",
          {
            p_registration_id: registrationId,
            p_team_members: JSON.stringify(body.team_members),
          }
        );

        if (updateMembersError) {
          console.error("Failed to update team members:", updateMembersError);
          return error("Failed to update team members", 500);
        }
      }

      // Fetch updated registration
      const { data: updatedReg } = await supabase
        .from("registrations")
        .select("*, team_members(*)")
        .eq("id", registrationId)
        .single();

      return success(updatedReg, "Team updated successfully");
    } catch (err) {
      console.error("Update team error:", err);
      return error("Failed to update team", 500);
    }
  }

  // POST /registrations/:id/cancel - Cancel registration
  if (req.method === "POST" && registrationId && action === "cancel") {
    try {
      const user = await getCurrentUser(req);

      if (!user) {
        return error("Unauthorized", 401);
      }

      const supabase = createUserClient(req);
      const adminClient = createAdminClient();

      const { data: registration } = await supabase
        .from("registrations")
        .select("*, sport:sports(*)")
        .eq("id", registrationId)
        .single();

      if (!registration) {
        return error("Registration not found", 404);
      }

      const isOwner = registration.participant_id === user.id;
      const userIsAdmin = user.role === "admin";

      if (!isOwner && !userIsAdmin) {
        return error("Unauthorized", 403);
      }

      if (["cancelled", "withdrawn"].includes(registration.status)) {
        return error("Registration already cancelled");
      }

      const body = await parseBody<CancelRequest>(req);

      // Update registration status
      const { data: updatedReg, error: updateError } = await adminClient
        .from("registrations")
        .update({
          status: isOwner ? "withdrawn" : "cancelled",
          withdrawal_reason: body?.reason,
          cancelled_by: user.id,
        })
        .eq("id", registrationId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to cancel registration", 500);
      }

      // Create notification
      const { error: notifError } = await adminClient.from("notifications").insert({
        recipient_id: registration.participant_id,
        type: "cancellation",
        title: "Registration Cancelled",
        message: `Your registration for ${registration.sport.name} has been cancelled.`,
        related_sport_id: registration.sport_id,
        related_registration_id: registrationId,
      });
      if (notifError) {
        console.error("Failed to create cancellation notification:", notifError);
      }

      // Create audit log
      try {
        await createAuditLog(
          adminClient,
          user.id,
          "CANCEL",
          "registrations",
          registrationId,
          { status: registration.status },
          { status: updatedReg.status, reason: body?.reason },
          req
        );
      } catch (auditErr) {
        console.error("Failed to create audit log:", auditErr);
      }

      return success(updatedReg, "Registration cancelled successfully");
    } catch (err) {
      console.error("Cancel registration error:", err);
      return error("Failed to cancel registration", 500);
    }
  }

  return error("Not found", 404);
});
