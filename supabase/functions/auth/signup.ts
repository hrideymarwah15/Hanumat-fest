// Auth Edge Functions - Signup
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createAdminClient,
  corsResponse,
  error,
  success,
  parseBody,
  validateRequired,
  isValidEmail,
  isValidPhone,
} from "../_shared/utils.ts";
import { sendEmail, getWelcomeEmailHtml } from "../_shared/email.ts";

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  college: string;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  if (req.method !== "POST") {
    return error("Method not allowed", 405);
  }

  try {
    const body = await parseBody<SignupRequest>(req);
    if (!body) {
      return error("Invalid request body");
    }

    // Validate required fields
    const { valid, missing } = validateRequired(body, [
      "email",
      "password",
      "name",
      "phone",
      "college",
    ]);

    if (!valid) {
      return error(`Missing required fields: ${missing.join(", ")}`);
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return error("Invalid email format");
    }

    // Validate phone format
    if (!isValidPhone(body.phone)) {
      return error("Invalid phone number. Please enter a valid 10-digit Indian mobile number");
    }

    // Validate password length
    if (body.password.length < 8) {
      return error("Password must be at least 8 characters long");
    }

    // Validate name length
    if (body.name.length < 2 || body.name.length > 100) {
      return error("Name must be between 2 and 100 characters");
    }

    const supabase = createAdminClient();

    // Create user with metadata - this is the single source of truth for duplicate detection
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
      console.error("Auth error:", authError);
      
      // Check for duplicate email using structured error fields first
      // Supabase Auth uses specific error codes/status for conflicts
      const isDuplicate = 
        // Check error code (Supabase uses specific codes like 'user_already_exists')
        authError.code === "user_already_exists" ||
        authError.code === "email_exists" ||
        authError.code === "23505" || // PostgreSQL unique violation
        // 409 always indicates conflict/duplicate
        authError.status === 409 ||
        // 422 only indicates duplicate if message confirms it (otherwise it's validation error)
        (authError.status === 422 && (
          authError.message?.toLowerCase().includes("already") ||
          authError.message?.toLowerCase().includes("duplicate") ||
          authError.message?.toLowerCase().includes("exists")
        )) ||
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
      return error("Failed to create account", 500);
    }

    // Profile should be created by the database trigger (handle_new_user)
    // But we verify it exists and handle edge cases with upsert
    // Retry profile creation with exponential backoff if it fails
    let profile = null;
    let profileError = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const { data, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          email: body.email,
          name: body.name,
          phone: body.phone,
          college: body.college,
        }, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();
      
      if (!upsertError) {
        profile = data;
        profileError = null;
        break;
      }
      
      profileError = upsertError;
      console.error(`Profile creation attempt ${attempt}/${maxRetries} failed:`, upsertError);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }

    if (profileError || !profile) {
      console.error("Profile creation failed after all retries:", profileError);
      // Return 207 Multi-Status - user created but profile failed
      return error("Account created but profile setup failed. Please contact support.", 207);
    }

    // Send welcome email (non-blocking)
    sendEmail({
      to: body.email,
      subject: `Welcome to Sports Fest ${new Date().getFullYear()}!`,
      html: getWelcomeEmailHtml(body.name),
    }).catch(console.error);

    return success(
      {
        user: authData.user,
        profile,
      },
      "Account created successfully"
    );
  } catch (err) {
    console.error("Signup error:", err);
    return error("Failed to create account", 500);
  }
});
