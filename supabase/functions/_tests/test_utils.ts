/**
 * Test Utilities for Edge Function Tests
 * 
 * This module provides shared utilities for testing Edge Functions:
 * - Test configuration and setup
 * - HTTP request helpers
 * - Mock data generators
 * - Assertion utilities
 */

import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";

// Re-export assertions for convenience
export { assertEquals, assertExists, assert };

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface TestConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  functionsUrl: string;
}

export function getTestConfig(): TestConfig {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing required environment variables. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    functionsUrl: `${supabaseUrl}/functions/v1`,
  };
}

// =============================================================================
// TEST USER MANAGEMENT
// =============================================================================

export interface TestUser {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  name: string;
  phone: string;
  college: string;
  role: "participant" | "admin" | "coordinator";
}

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
  };
}

/**
 * Create a test user via Supabase Auth
 */
export async function createTestUser(
  config: TestConfig,
  userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
    college: string;
    role?: "participant" | "admin" | "coordinator";
  }
): Promise<TestUser> {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey,
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      data: {
        name: userData.name,
        phone: userData.phone,
        college: userData.college,
      },
    }),
  });

  const data = await response.json() as AuthResponse;

  if (!data.access_token) {
    throw new Error(`Failed to create test user: ${JSON.stringify(data)}`);
  }

  // If admin/coordinator role needed, update via service role
  if (userData.role && userData.role !== "participant") {
    const roleResponse = await fetch(
      `${config.supabaseUrl}/rest/v1/profiles?id=eq.${data.user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: config.supabaseServiceRoleKey,
          Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
        },
        body: JSON.stringify({ role: userData.role }),
      }
    );
    
    if (!roleResponse.ok) {
      throw new Error(
        `Failed to update user role to ${userData.role}: ${roleResponse.status}`
      );
    }
  }

  return {
    id: data.user.id,
    email: userData.email,
    password: userData.password,
    accessToken: data.access_token,
    name: userData.name,
    phone: userData.phone,
    college: userData.college,
    role: userData.role || "participant",
  };
}

/**
 * Login an existing test user
 */
export async function loginTestUser(
  config: TestConfig,
  email: string,
  password: string
): Promise<string> {
  const response = await fetch(
    `${config.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await response.json() as AuthResponse;

  if (!data.access_token) {
    throw new Error(`Failed to login: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Delete a test user (cleanup)
 */
export async function deleteTestUser(
  config: TestConfig,
  userId: string
): Promise<void> {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });
  
  if (!response.ok) {
    console.warn(`Failed to delete test user ${userId}: ${response.status}`);
  }
}

// =============================================================================
// HTTP REQUEST HELPERS
// =============================================================================

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  accessToken?: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  data: {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  };
  headers: Headers;
}

/**
 * Make an authenticated request to an Edge Function
 */
export async function request<T = unknown>(
  config: TestConfig,
  functionName: string,
  path: string = "",
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, accessToken } = options;

  // Normalize path: trim leading slashes to prevent double slashes
  const normalizedPath = path.replace(/^\/+/, "");
  const url = `${config.functionsUrl}/${functionName}${normalizedPath ? `/${normalizedPath}` : ""}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: config.supabaseAnonKey,
    ...headers,
  };

  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    // Non-JSON response
    responseData = {
      success: false,
      error: `Non-JSON response: ${response.status}`,
    };
  }

  return {
    status: response.status,
    data: responseData,
    headers: response.headers,
  };
}

/**
 * Make an admin request (using service role key)
 */
export async function adminRequest<T = unknown>(
  config: TestConfig,
  functionName: string,
  path: string = "",
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return request<T>(config, functionName, path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });
}

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================

let testCounter = 0;

/**
 * Generate a unique test email
 */
export function generateTestEmail(): string {
  testCounter++;
  return `test_${Date.now()}_${testCounter}@example.com`;
}

/**
 * Generate a valid Indian phone number
 */
export function generateTestPhone(): string {
  return `9${Math.floor(100000000 + Math.random() * 900000000)}`;
}

/**
 * Generate mock user data
 */
export function generateMockUserData() {
  return {
    email: generateTestEmail(),
    password: "TestPass123!",
    name: `Test User ${testCounter}`,
    phone: generateTestPhone(),
    college: "Test Engineering College",
  };
}

/**
 * Generate mock sport data
 */
export function generateMockSportData() {
  const now = new Date();
  const regStart = new Date(now.getTime() - 86400000); // Yesterday
  const regEnd = new Date(now.getTime() + 7 * 86400000); // 7 days from now
  const eventStart = new Date(now.getTime() + 14 * 86400000); // 14 days from now
  const eventEnd = new Date(now.getTime() + 15 * 86400000); // 15 days from now

  return {
    name: `Test Sport ${Date.now()}`,
    category: "indoor",
    description: "A test sport for automated testing",
    rules: "Standard rules apply",
    is_team_event: false,
    fees: 100,
    registration_start: regStart.toISOString(),
    registration_deadline: regEnd.toISOString(),
    schedule_start: eventStart.toISOString(),
    schedule_end: eventEnd.toISOString(),
    venue: "Test Arena",
    max_participants: 50,
    waitlist_enabled: true,
  };
}

/**
 * Generate mock team sport data
 */
export function generateMockTeamSportData() {
  return {
    ...generateMockSportData(),
    name: `Test Team Sport ${Date.now()}`,
    is_team_event: true,
    team_size_min: 3,
    team_size_max: 5,
    max_participants: 10,
  };
}

/**
 * Generate mock team members
 */
export function generateMockTeamMembers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Team Member ${i + 1}`,
    email: generateTestEmail(),
    phone: generateTestPhone(),
    is_captain: i === 0,
  }));
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Assert that a response is successful (status 200, success: true)
 */
export function assertSuccess<T>(
  response: ApiResponse<T>,
  message?: string
): asserts response is ApiResponse<T> & { data: { success: true; data: T } } {
  assertEquals(
    response.status,
    200,
    message || `Expected status 200, got ${response.status}: ${JSON.stringify(response.data)}`
  );
  assertEquals(
    response.data.success,
    true,
    message || `Expected success: true, got: ${JSON.stringify(response.data)}`
  );
}

/**
 * Assert that a response is an error with expected status
 */
export function assertError(
  response: ApiResponse,
  expectedStatus: number,
  expectedErrorContains?: string
): void {
  assertEquals(
    response.status,
    expectedStatus,
    `Expected status ${expectedStatus}, got ${response.status}`
  );
  assertEquals(
    response.data.success,
    false,
    `Expected success: false, got: ${JSON.stringify(response.data)}`
  );

  if (expectedErrorContains) {
    assert(
      response.data.error?.includes(expectedErrorContains),
      `Expected error to contain "${expectedErrorContains}", got: ${response.data.error}`
    );
  }
}

/**
 * Assert that a response is unauthorized (401)
 */
export function assertUnauthorized(response: ApiResponse): void {
  assertError(response, 401);
}

/**
 * Assert that a response is forbidden (403)
 */
export function assertForbidden(response: ApiResponse): void {
  assertError(response, 403);
}

/**
 * Assert that a response is not found (404)
 */
export function assertNotFound(response: ApiResponse): void {
  assertError(response, 404);
}

// =============================================================================
// DATABASE HELPERS
// =============================================================================

/**
 * Query the database directly using the REST API
 */
export async function dbQuery<T>(
  config: TestConfig,
  table: string,
  query: string = ""
): Promise<T[]> {
  const response = await fetch(
    `${config.supabaseUrl}/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      headers: {
        apikey: config.supabaseServiceRoleKey,
        Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Database query failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Insert data into a table
 */
export async function dbInsert<T>(
  config: TestConfig,
  table: string,
  data: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Database insert failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Delete data from a table
 */
export async function dbDelete(
  config: TestConfig,
  table: string,
  query: string
): Promise<void> {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Database delete failed for table "${table}" with query "${query}": ${response.status} - ${errorText}`
    );
  }
}

// =============================================================================
// TEST LIFECYCLE HELPERS
// =============================================================================

export interface TestContext {
  config: TestConfig;
  testUser?: TestUser;
  adminUser?: TestUser;
  createdResources: {
    users: string[];
    sports: string[];
    registrations: string[];
    payments: string[];
  };
}

/**
 * Create a fresh test context
 */
export function createTestContext(): TestContext {
  return {
    config: getTestConfig(),
    createdResources: {
      users: [],
      sports: [],
      registrations: [],
      payments: [],
    },
  };
}

/**
 * Cleanup all resources created during a test
 */
export async function cleanupTestContext(ctx: TestContext): Promise<void> {
  const { config, createdResources } = ctx;
  const errors: Error[] = [];

  // Delete in reverse order of dependencies
  for (const paymentId of createdResources.payments) {
    try {
      await dbDelete(config, "payments", `id=eq.${paymentId}`);
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  for (const regId of createdResources.registrations) {
    try {
      await dbDelete(config, "team_members", `registration_id=eq.${regId}`);
      await dbDelete(config, "registrations", `id=eq.${regId}`);
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  for (const sportId of createdResources.sports) {
    try {
      await dbDelete(config, "sports", `id=eq.${sportId}`);
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  for (const userId of createdResources.users) {
    try {
      await deleteTestUser(config, userId);
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  if (errors.length > 0) {
    console.warn(`Cleanup encountered ${errors.length} error(s):`, errors);
  }
}

/**
 * Setup a test user for the context
 */
export async function setupTestUser(ctx: TestContext): Promise<TestUser> {
  const userData = generateMockUserData();
  const user = await createTestUser(ctx.config, userData);
  ctx.testUser = user;
  ctx.createdResources.users.push(user.id);
  return user;
}

/**
 * Setup an admin user for the context
 */
export async function setupAdminUser(ctx: TestContext): Promise<TestUser> {
  const userData = {
    ...generateMockUserData(),
    role: "admin" as const,
  };
  const user = await createTestUser(ctx.config, userData);
  ctx.adminUser = user;
  ctx.createdResources.users.push(user.id);
  return user;
}

// =============================================================================
// TEST WRAPPER
// =============================================================================

type TestFn = (ctx: TestContext) => Promise<void>;

/**
 * Wrap a test function with automatic context setup and cleanup
 */
export function withTestContext(testFn: TestFn): () => Promise<void> {
  return async () => {
    const ctx = createTestContext();
    try {
      await testFn(ctx);
    } finally {
      await cleanupTestContext(ctx);
    }
  };
}
