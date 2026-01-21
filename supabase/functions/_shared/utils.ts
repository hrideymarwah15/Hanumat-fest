// Shared utilities for Edge Functions
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  college: string;
  role: "participant" | "admin" | "coordinator";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Environment variables
export const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
export const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
export const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
export const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
export const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
export const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
export const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:3000";

// Create Supabase client with user's JWT
export function createUserClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get("Authorization");
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: authHeader || "" },
    },
  });
}

// Create Supabase admin client (bypasses RLS)
export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

// Get current user from request
export async function getCurrentUser(req: Request): Promise<User | null> {
  const supabase = createUserClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  return profile;
}

// Check if user is admin
export async function isAdmin(req: Request): Promise<boolean> {
  const user = await getCurrentUser(req);
  return user?.role === "admin";
}

// Check if user is coordinator or admin
export async function isCoordinator(req: Request): Promise<boolean> {
  const user = await getCurrentUser(req);
  return user?.role === "admin" || user?.role === "coordinator";
}

// Standard JSON response
export function jsonResponse<T>(data: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

// Success response helper
export function success<T>(data: T, message?: string): Response {
  return jsonResponse({ success: true, data, message }, 200);
}

// Error response helper
export function error(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// CORS preflight response
export function corsResponse(): Response {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

// Validate required fields
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );
  return { valid: missing.length === 0, missing };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate Indian phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

// Create audit log entry
export async function createAuditLog(
  adminClient: SupabaseClient,
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
  req: Request
): Promise<void> {
  // Parse x-forwarded-for to get the originating client IP (first in the list)
  const xForwardedFor = req.headers.get("x-forwarded-for");
  let ipAddress: string | null = null;
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    const ips = xForwardedFor.split(",").map(ip => ip.trim()).filter(ip => ip);
    ipAddress = ips[0] || null;
  }
  
  // Fallback to x-real-ip if no usable IP found
  if (!ipAddress) {
    ipAddress = req.headers.get("x-real-ip");
  }

  const { error } = await adminClient.from("audit_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
    ip_address: ipAddress,
    user_agent: req.headers.get("user-agent"),
    request_id: req.headers.get("x-request-id"),
  });
  
  if (error) {
    console.error("Failed to create audit log:", error, {
      userId,
      action,
      entityType,
      entityId,
    });
  }
}

// Parse request body safely
export async function parseBody<T>(req: Request): Promise<T | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

// Get query params from URL
export function getQueryParams(req: Request): URLSearchParams {
  const url = new URL(req.url);
  return url.searchParams;
}

// Pagination helper
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function getPagination(params: URLSearchParams): PaginationParams {
  const parsedPage = parseInt(params.get("page") || "1", 10);
  const parsedLimit = parseInt(params.get("limit") || "20", 10);
  
  // Handle NaN with fallback to defaults
  const page = Math.max(1, Number.isNaN(parsedPage) ? 1 : parsedPage);
  const limit = Math.min(100, Math.max(1, Number.isNaN(parsedLimit) ? 20 : parsedLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
