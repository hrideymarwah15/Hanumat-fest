/**
 * Auth Edge Function Tests
 * 
 * Tests for the authentication and profile management endpoints:
 * - POST /auth/signup - User registration
 * - GET /auth/profile - Get current user profile
 * - PATCH /auth/profile - Update user profile
 */

import {
  assertEquals,
  assertExists,
  request,
  assertSuccess,
  assertError,
  assertUnauthorized,
  createTestContext,
  cleanupTestContext,
  setupTestUser,
  generateMockUserData,
  TestContext,
} from "./test_utils.ts";

// =============================================================================
// TEST: POST /auth/signup - User Registration
// =============================================================================

Deno.test({
  name: "Auth: POST /signup - should create a new user with valid data",
  async fn() {
    const ctx = createTestContext();

    try {
      const userData = generateMockUserData();

      const response = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: userData,
      });

      assertSuccess(response);
      assertExists(response.data.data?.user, "User should be returned");
      assertExists(response.data.data?.profile, "Profile should be returned");
      assertEquals(
        response.data.data?.profile?.email,
        userData.email,
        "Email should match"
      );
      assertEquals(
        response.data.data?.profile?.name,
        userData.name,
        "Name should match"
      );
      assertEquals(
        response.data.data?.profile?.role,
        "participant",
        "Default role should be participant"
      );

      // Track for cleanup
      if (response.data.data?.user?.id) {
        ctx.createdResources.users.push(response.data.data.user.id);
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: POST /signup - should reject missing required fields",
  async fn() {
    const ctx = createTestContext();

    try {
      // Missing name
      const response = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: {
          email: "test@example.com",
          password: "password123",
          phone: "9876543210",
          college: "Test College",
          // name is missing
        },
      });

      assertError(response, 400, "Missing required fields");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: POST /signup - should reject invalid email format",
  async fn() {
    const ctx = createTestContext();

    try {
      const userData = {
        ...generateMockUserData(),
        email: "invalid-email",
      };

      const response = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: userData,
      });

      assertError(response, 400, "Invalid email");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: POST /signup - should reject invalid phone number",
  async fn() {
    const ctx = createTestContext();

    try {
      const userData = {
        ...generateMockUserData(),
        phone: "12345", // Invalid Indian phone number
      };

      const response = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: userData,
      });

      assertError(response, 400, "Invalid phone");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: POST /signup - should reject short password",
  async fn() {
    const ctx = createTestContext();

    try {
      const userData = {
        ...generateMockUserData(),
        password: "short",
      };

      const response = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: userData,
      });

      assertError(response, 400, "Password must be at least 8 characters");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: POST /signup - should reject duplicate email",
  async fn() {
    const ctx = createTestContext();

    try {
      // Create first user
      const user = await setupTestUser(ctx);

      // Try to create another user with the same email
      const response = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: {
          email: user.email,
          password: "password123",
          name: "Duplicate User",
          phone: "9876543210",
          college: "Test College",
        },
      });

      assertError(response, 409, "Email already registered");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /auth/profile - Get Profile
// =============================================================================

Deno.test({
  name: "Auth: GET /profile - should return profile for authenticated user",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "auth", "profile", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.profile, "Profile should be returned");
      assertEquals(
        response.data.data?.profile?.email,
        user.email,
        "Email should match"
      );
      assertExists(
        response.data.data?.registrations_count,
        "Registrations count should be returned"
      );
      assertExists(
        response.data.data?.unread_notifications,
        "Unread notifications should be returned"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: GET /profile - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "auth", "profile", {
        method: "GET",
        // No access token
      });

      assertUnauthorized(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: GET /profile - should reject invalid token",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "auth", "profile", {
        method: "GET",
        accessToken: "invalid-token",
      });

      assertUnauthorized(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: PATCH /auth/profile - Update Profile
// =============================================================================

Deno.test({
  name: "Auth: PATCH /profile - should update profile with valid data",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const updates = {
        name: "Updated Name",
        phone: "9876543211",
        college: "Updated College",
      };

      const response = await request(ctx.config, "auth", "profile", {
        method: "PATCH",
        accessToken: user.accessToken,
        body: updates,
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.name,
        updates.name,
        "Name should be updated"
      );
      assertEquals(
        response.data.data?.phone,
        updates.phone,
        "Phone should be updated"
      );
      assertEquals(
        response.data.data?.college,
        updates.college,
        "College should be updated"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: PATCH /profile - should update single field",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const originalName = user.name;

      const response = await request(ctx.config, "auth", "profile", {
        method: "PATCH",
        accessToken: user.accessToken,
        body: {
          college: "New College Only",
        },
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.name,
        originalName,
        "Name should remain unchanged"
      );
      assertEquals(
        response.data.data?.college,
        "New College Only",
        "College should be updated"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: PATCH /profile - should reject empty update",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "auth", "profile", {
        method: "PATCH",
        accessToken: user.accessToken,
        body: {},
      });

      assertError(response, 400, "No fields to update");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: PATCH /profile - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "auth", "profile", {
        method: "PATCH",
        body: { name: "New Name" },
        // No access token
      });

      assertUnauthorized(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Auth: PATCH /profile - should update avatar URL",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const avatarUrl = "https://example.com/avatar.jpg";

      const response = await request(ctx.config, "auth", "profile", {
        method: "PATCH",
        accessToken: user.accessToken,
        body: { avatar_url: avatarUrl },
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.avatar_url,
        avatarUrl,
        "Avatar URL should be updated"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// CORS Tests
// =============================================================================

Deno.test({
  name: "Auth: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(`${ctx.config.functionsUrl}/auth/signup`, {
        method: "OPTIONS",
        headers: {
          apikey: ctx.config.supabaseAnonKey,
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      });

      assertEquals(response.status, 200, "CORS preflight should succeed");
      assertExists(
        response.headers.get("Access-Control-Allow-Origin"),
        "Should have CORS headers"
      );
      assertExists(
        response.headers.get("Access-Control-Allow-Methods"),
        "Should have allowed methods"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// Invalid Route Tests
// =============================================================================

Deno.test({
  name: "Auth: should return 404 for unknown routes",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "auth", "unknown-route", {
        method: "GET",
      });

      assertEquals(response.status, 404, "Should return 404");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
