// Auth Edge Functions - Main entry point (index.ts)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createUserClient,
  createAdminClient,
  corsResponse,
  error,
  success,
  parseBody,
  validateRequired,
  isValidEmail,
  isValidPhone,
  getCurrentUser,
} from "../_shared/utils.ts";
import { sendEmail, getWelcomeEmailHtml } from "../_shared/email.ts";

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  college: string;
}

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

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  // POST /auth/signup
  if (path === "signup" && req.method === "POST") {
    try {
      const body = await parseBody<SignupRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, [
        "email", "password", "name", "phone", "college",
      ]);

      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      if (!isValidEmail(body.email)) {
        return error("Invalid email format");
      }

      if (!isValidPhone(body.phone)) {
        return error("Invalid phone number");
      }

      if (body.password.length < 8) {
        return error("Password must be at least 8 characters");
      }

      const supabase = createAdminClient();

      // Let createUser be the source of truth - don't pre-check for duplicates (TOCTOU race)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: false,
        user_metadata: {
          name: body.name,
          phone: body.phone,
          college: body.college,
        },
      });

      if (authError) {
        // Check for duplicate email using structured error fields first
        // Supabase Auth uses specific error codes/status for conflicts
        const isDuplicate = 
          // Check error code (Supabase uses specific codes like 'user_already_exists')
          authError.code === "user_already_exists" ||
          authError.code === "email_exists" ||
          authError.code === "23505" || // PostgreSQL unique violation
          // Check HTTP status codes that indicate conflict
          authError.status === 409 ||
          authError.status === 422 ||
          // Fallback to message matching only if no structured code is present
          (!authError.code && !authError.status && (
            authError.message?.toLowerCase().includes("already") || 
            authError.message?.toLowerCase().includes("duplicate") ||
            authError.message?.toLowerCase().includes("exists")
          ));
        
        if (isDuplicate) {
          return error("Email already registered", 409);
        }
        // Mask raw auth error messages to avoid leaking internal details
        console.error("Auth createUser error:", authError);
        return error("Failed to create account", 500);
      }

      // Fetch profile with retry (trigger may have slight delay)
      let profile = null;
      let profileError = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        
        if (!fetchError && data) {
          profile = data;
          break;
        }
        
        profileError = fetchError;
        
        // If not last attempt, wait with exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
        }
      }

      // If profile still not found after retries, return partial success
      if (!profile) {
        console.error("Profile fetch failed after retries:", profileError);
        // Still return success since user was created - profile will sync eventually
        return success(
          { user: authData.user, profile: null },
          "Account created (profile sync pending)"
        );
      }

      sendEmail({
        to: body.email,
        subject: `Welcome to Sports Fest ${new Date().getFullYear()}!`,
        html: getWelcomeEmailHtml(body.name),
      }).catch(console.error);

      return success({ user: authData.user, profile }, "Account created successfully");
    } catch (err) {
      console.error("Signup error:", err);
      return error("Failed to create account", 500);
    }
  }

  // GET /auth/profile
  if (path === "profile" && req.method === "GET") {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return error("Unauthorized", 401);
      }

      const supabase = createUserClient(req);

      const { count: registrationsCount, error: regError } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("participant_id", user.id)
        .neq("status", "cancelled");

      if (regError) {
        console.error("Failed to fetch registrations count:", regError);
      }

      const { count: unreadNotifications, error: notifError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (notifError) {
        console.error("Failed to fetch notifications count:", notifError);
      }

      return success({
        profile: user,
        registrations_count: registrationsCount || 0,
        unread_notifications: unreadNotifications || 0,
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      return error("Internal Server Error", 500);
    }
  }

  // PATCH /auth/profile
  if (path === "profile" && req.method === "PATCH") {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return error("Unauthorized", 401);
      }

      const body = await parseBody<UpdateProfileRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const updates: Record<string, unknown> = {};
      
      // Validate and add name
      if (body.name !== undefined) {
        if (body.name.length < 2 || body.name.length > 100) {
          return error("Name must be between 2 and 100 characters");
        }
        updates.name = body.name;
      }
      
      // Validate and add phone
      if (body.phone !== undefined) {
        if (!isValidPhone(body.phone)) {
          return error("Invalid phone number. Please enter a valid 10-digit Indian mobile number");
        }
        updates.phone = body.phone;
      }
      
      // Validate and add college
      if (body.college !== undefined) {
        if (body.college.length < 2 || body.college.length > 200) {
          return error("College name must be between 2 and 200 characters");
        }
        updates.college = body.college;
      }
      
      // Validate and add avatar_url
      if (body.avatar_url !== undefined) {
        // Allow empty string to clear avatar
        if (body.avatar_url !== "") {
          try {
            const url = new URL(body.avatar_url);
            // Only allow https URLs for security
            if (url.protocol !== "https:") {
              return error("Avatar URL must use HTTPS");
            }
          } catch {
            return error("Invalid avatar URL format");
          }
        }
        updates.avatar_url = body.avatar_url;
      }

      if (Object.keys(updates).length === 0) {
        return error("No fields to update");
      }

      const supabase = createUserClient(req);
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Profile update error:", updateError);
        return error("Failed to update profile", 500);
      }

      return success(data, "Profile updated successfully");
    } catch (err) {
      console.error("Profile PATCH error:", err);
      return error("Failed to update profile", 500);
    }
  }

  return error("Not found", 404);
});
