// Auth Edge Functions - Get/Update Profile
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createUserClient,
  corsResponse,
  error,
  success,
  parseBody,
  getCurrentUser,
} from "../_shared/utils.ts";

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  college?: string;
  avatar_url?: string;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  const supabase = createUserClient(req);
  const user = await getCurrentUser(req);

  if (!user) {
    return error("Unauthorized", 401);
  }

  // GET - Get profile with summary
  if (req.method === "GET") {
    try {
      // Get registrations count
      const { count: registrationsCount, error: regError } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("participant_id", user.id)
        .neq("status", "cancelled");

      if (regError) {
        console.error("Failed to fetch registrations count:", regError);
        return error("Failed to get profile data", 500);
      }

      // Get unread notifications count
      const { count: unreadNotifications, error: notifError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (notifError) {
        console.error("Failed to fetch notifications count:", notifError);
        return error("Failed to get profile data", 500);
      }

      return success({
        profile: user,
        registrations_count: registrationsCount || 0,
        unread_notifications: unreadNotifications || 0,
      });
    } catch (err) {
      console.error("Get profile error:", err);
      return error("Failed to get profile", 500);
    }
  }

  // PATCH - Update profile
  if (req.method === "PATCH") {
    try {
      const body = await parseBody<UpdateProfileRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      // Build update object with only provided fields
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.phone !== undefined) updates.phone = body.phone;
      if (body.college !== undefined) updates.college = body.college;
      if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

      if (Object.keys(updates).length === 0) {
        return error("No fields to update");
      }

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return error("Failed to update profile", 500);
      }

      return success(data, "Profile updated successfully");
    } catch (err) {
      console.error("Update profile error:", err);
      return error("Failed to update profile", 500);
    }
  }

  return error("Method not allowed", 405);
});
