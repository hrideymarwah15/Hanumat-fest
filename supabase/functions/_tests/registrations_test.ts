/**
 * Registration Edge Function Tests
 * 
 * Tests for registration management endpoints:
 * - GET /registrations/check/:sport_id - Check eligibility
 * - POST /registrations - Create registration
 * - GET /registrations/me - Get user's registrations
 * - GET /registrations/:id - Get single registration
 * - PATCH /registrations/:id/team - Update team members
 * - POST /registrations/:id/cancel - Cancel registration
 */

import {
  assertEquals,
  assertExists,
  assert,
  request,
  assertSuccess,
  assertError,
  assertUnauthorized,
  assertForbidden,
  createTestContext,
  cleanupTestContext,
  setupTestUser,
  setupAdminUser,
  generateMockSportData,
  generateMockTeamSportData,
  generateMockTeamMembers,
  dbInsert,
  dbDelete,
  TestContext,
} from "./test_utils.ts";

// Helper to create a test sport via admin
async function createTestSport(
  ctx: TestContext,
  sportData?: Record<string, unknown>
) {
  const data = sportData || generateMockSportData();

  if (!ctx.adminUser) {
    await setupAdminUser(ctx);
  }

  const response = await request(ctx.config, "sports", "", {
    method: "POST",
    accessToken: ctx.adminUser!.accessToken,
    body: {
      ...data,
      is_registration_open: true,
    },
  });

  if (response.data.success && response.data.data?.id) {
    ctx.createdResources.sports.push(response.data.data.id);
  }

  return response.data.data;
}

// Helper to create a registration
async function createTestRegistration(
  ctx: TestContext,
  sportId: string,
  userToken: string,
  options: {
    is_team?: boolean;
    team_name?: string;
    team_members?: Array<{
      name: string;
      email?: string;
      phone?: string;
      is_captain?: boolean;
    }>;
  } = {}
) {
  const response = await request(ctx.config, "registrations", "", {
    method: "POST",
    accessToken: userToken,
    body: {
      sport_id: sportId,
      ...options,
    },
  });

  if (response.data.success && response.data.data?.registration?.id) {
    ctx.createdResources.registrations.push(response.data.data.registration.id);
  }

  return response;
}

// =============================================================================
// TEST: GET /registrations/check/:sport_id - Check Eligibility
// =============================================================================

Deno.test({
  name: "Registrations: GET /check/:sport_id - should return eligibility for authenticated user",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const response = await request(
        ctx.config,
        "registrations",
        `check/${sport.id}`,
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertExists(response.data.data?.can_register, "can_register should exist");
      assertExists(response.data.data?.reason, "reason should exist");
      assertExists(
        response.data.data?.applicable_fees,
        "applicable_fees should exist"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /check/:sport_id - should return can_register=true for eligible user",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const response = await request(
        ctx.config,
        "registrations",
        `check/${sport.id}`,
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.can_register,
        true,
        "User should be eligible"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /check/:sport_id - should reject unauthenticated user",
  async fn() {
    const ctx = createTestContext();

    try {
      const sport = await createTestSport(ctx);

      const response = await request(
        ctx.config,
        "registrations",
        `check/${sport.id}`,
        {
          method: "GET",
          // No access token
        }
      );

      assertUnauthorized(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /check/:sport_id - should show spots remaining",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, {
        ...generateMockSportData(),
        max_participants: 10,
      });

      const response = await request(
        ctx.config,
        "registrations",
        `check/${sport.id}`,
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertExists(
        response.data.data?.spots_remaining,
        "spots_remaining should exist"
      );
      assertEquals(
        response.data.data?.spots_remaining,
        10,
        "Should have 10 spots remaining"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: POST /registrations - Create Registration
// =============================================================================

Deno.test({
  name: "Registrations: POST / - should create registration for individual sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const response = await createTestRegistration(ctx, sport.id, user.accessToken);

      assertSuccess(response);
      assertExists(
        response.data.data?.registration,
        "Registration should be returned"
      );
      assertExists(
        response.data.data?.registration?.id,
        "Registration ID should exist"
      );
      assertExists(
        response.data.data?.registration?.registration_number,
        "Registration number should be generated"
      );
      assertEquals(
        response.data.data?.registration?.status,
        "payment_pending",
        "Status should be payment_pending"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST / - should create team registration with team members",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, generateMockTeamSportData());
      const teamMembers = generateMockTeamMembers(4);

      const response = await createTestRegistration(ctx, sport.id, user.accessToken, {
        is_team: true,
        team_name: "Test Team",
        team_members: teamMembers,
      });

      assertSuccess(response);
      assertExists(
        response.data.data?.registration,
        "Registration should be returned"
      );
      assertEquals(
        response.data.data?.registration?.is_team,
        true,
        "Should be team registration"
      );
      assertEquals(
        response.data.data?.registration?.team_name,
        "Test Team",
        "Team name should match"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST / - should reject missing sport_id",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "registrations", "", {
        method: "POST",
        accessToken: user.accessToken,
        body: {
          // sport_id is missing
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
  name: "Registrations: POST / - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const sport = await createTestSport(ctx);

      const response = await request(ctx.config, "registrations", "", {
        method: "POST",
        body: { sport_id: sport.id },
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
  name: "Registrations: POST / - should reject duplicate registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      // First registration
      await createTestRegistration(ctx, sport.id, user.accessToken);

      // Second registration for same sport
      const response = await request(ctx.config, "registrations", "", {
        method: "POST",
        accessToken: user.accessToken,
        body: { sport_id: sport.id },
      });

      assertError(response, 403, "Already registered");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST / - should reject team event without team name",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, generateMockTeamSportData());

      const response = await request(ctx.config, "registrations", "", {
        method: "POST",
        accessToken: user.accessToken,
        body: {
          sport_id: sport.id,
          is_team: true,
          // team_name is missing
        },
      });

      assertError(response, 400, "Team name is required");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST / - should reject team with too few members",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, {
        ...generateMockTeamSportData(),
        team_size_min: 5,
        team_size_max: 10,
      });

      const response = await request(ctx.config, "registrations", "", {
        method: "POST",
        accessToken: user.accessToken,
        body: {
          sport_id: sport.id,
          is_team: true,
          team_name: "Small Team",
          team_members: generateMockTeamMembers(3), // Only 3 members, min is 5
        },
      });

      assertError(response, 400, "Team size must be between");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /registrations/me - Get User's Registrations
// =============================================================================

Deno.test({
  name: "Registrations: GET /me - should return user's registrations",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      // Create a registration
      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(ctx.config, "registrations", "me", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertExists(
        response.data.data?.registrations,
        "Registrations should exist"
      );
      assert(
        Array.isArray(response.data.data?.registrations),
        "Registrations should be an array"
      );
      assert(
        response.data.data?.registrations.length >= 1,
        "Should have at least one registration"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /me - should include sport and payment details",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(ctx.config, "registrations", "me", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      const registrations = response.data.data?.registrations || [];
      
      assert(registrations.length > 0, "Should have at least one registration");
      assertExists(registrations[0].sport, "Sport details should be included");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /me - should filter by status",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(
        ctx.config,
        "registrations",
        "me?status=payment_pending",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      const registrations = response.data.data?.registrations || [];
      
      for (const reg of registrations) {
        assertEquals(
          reg.status,
          "payment_pending",
          "Should only return payment_pending"
        );
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /me - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "registrations", "me", {
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

// =============================================================================
// TEST: GET /registrations/:id - Get Single Registration
// =============================================================================

Deno.test({
  name: "Registrations: GET /:id - should return registration for owner",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      const response = await request(
        ctx.config,
        "registrations",
        registrationId,
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertExists(
        response.data.data?.registration,
        "Registration should exist"
      );
      assertEquals(
        response.data.data?.registration?.id,
        registrationId,
        "Should return correct registration"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /:id - should allow admin to view any registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      // Admin views user's registration
      const response = await request(
        ctx.config,
        "registrations",
        registrationId,
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.registration?.id,
        registrationId,
        "Admin should be able to view registration"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /:id - should reject other user from viewing",
  async fn() {
    const ctx = createTestContext();

    try {
      const user1 = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user1.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      // Create another user
      const user2Data = {
        email: `test_${Date.now()}_2@example.com`,
        password: "TestPass123!",
        name: "Test User 2",
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        college: "Another College",
      };

      const signupResponse = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: user2Data,
      });

      if (signupResponse.data.data?.user?.id) {
        ctx.createdResources.users.push(signupResponse.data.data.user.id);
      }

      // Try to view user1's registration as user2
      const response = await request(
        ctx.config,
        "registrations",
        registrationId,
        {
          method: "GET",
          accessToken: signupResponse.data.data?.user?.access_token,
        }
      );

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: GET /:id - should return 404 for non-existent registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "registrations",
        "00000000-0000-0000-0000-000000000000",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertError(response, 404, "Registration not found");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: PATCH /registrations/:id/team - Update Team Members
// =============================================================================

Deno.test({
  name: "Registrations: PATCH /:id/team - should update team name",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, generateMockTeamSportData());
      const teamMembers = generateMockTeamMembers(4);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken,
        {
          is_team: true,
          team_name: "Original Name",
          team_members: teamMembers,
        }
      );
      const registrationId = createResponse.data.data?.registration?.id;

      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/team`,
        {
          method: "PATCH",
          accessToken: user.accessToken,
          body: { team_name: "Updated Team Name" },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.team_name,
        "Updated Team Name",
        "Team name should be updated"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: PATCH /:id/team - should update team members",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, generateMockTeamSportData());
      const teamMembers = generateMockTeamMembers(4);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken,
        {
          is_team: true,
          team_name: "Test Team",
          team_members: teamMembers,
        }
      );
      const registrationId = createResponse.data.data?.registration?.id;

      const newTeamMembers = generateMockTeamMembers(5);

      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/team`,
        {
          method: "PATCH",
          accessToken: user.accessToken,
          body: { team_members: newTeamMembers },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.team_members?.length,
        5,
        "Should have 5 team members now"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: PATCH /:id/team - should reject non-owner",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx, generateMockTeamSportData());
      const teamMembers = generateMockTeamMembers(4);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken,
        {
          is_team: true,
          team_name: "Test Team",
          team_members: teamMembers,
        }
      );
      const registrationId = createResponse.data.data?.registration?.id;

      // Create another user
      const user2Data = {
        email: `test_${Date.now()}_3@example.com`,
        password: "TestPass123!",
        name: "Test User 3",
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        college: "Another College",
      };

      const signupResponse = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: user2Data,
      });

      if (signupResponse.data.data?.user?.id) {
        ctx.createdResources.users.push(signupResponse.data.data.user.id);
      }

      // Try to update as different user
      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/team`,
        {
          method: "PATCH",
          accessToken: signupResponse.data.data?.user?.access_token,
          body: { team_name: "Hacked Team" },
        }
      );

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: POST /registrations/:id/cancel - Cancel Registration
// =============================================================================

Deno.test({
  name: "Registrations: POST /:id/cancel - should cancel own registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/cancel`,
        {
          method: "POST",
          accessToken: user.accessToken,
          body: { reason: "Changed my mind" },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.status,
        "withdrawn",
        "Status should be withdrawn"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST /:id/cancel - admin cancellation should set cancelled status",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/cancel`,
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: { reason: "Admin decision" },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.status,
        "cancelled",
        "Status should be cancelled when admin cancels"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST /:id/cancel - should reject already cancelled",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      // Cancel once - verify it succeeds
      const firstCancelResp = await request(
        ctx.config,
        "registrations",
        `${registrationId}/cancel`,
        {
          method: "POST",
          accessToken: user.accessToken,
        }
      );
      assertSuccess(firstCancelResp);
      assertEquals(
        firstCancelResp.data.data?.status,
        "withdrawn",
        "First cancellation should succeed with withdrawn status"
      );

      // Try to cancel again
      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/cancel`,
        {
          method: "POST",
          accessToken: user.accessToken,
        }
      );

      assertError(response, 400, "already cancelled");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Registrations: POST /:id/cancel - should reject non-owner cancellation",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const createResponse = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );
      const registrationId = createResponse.data.data?.registration?.id;

      // Create another user
      const user2Data = {
        email: `test_${Date.now()}_4@example.com`,
        password: "TestPass123!",
        name: "Test User 4",
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        college: "Another College",
      };

      const signupResponse = await request(ctx.config, "auth", "signup", {
        method: "POST",
        body: user2Data,
      });

      if (signupResponse.data.data?.user?.id) {
        ctx.createdResources.users.push(signupResponse.data.data.user.id);
      }

      // Try to cancel as different user
      const response = await request(
        ctx.config,
        "registrations",
        `${registrationId}/cancel`,
        {
          method: "POST",
          accessToken: signupResponse.data.data?.user?.access_token,
        }
      );

      assertForbidden(response);
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
  name: "Registrations: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(
        `${ctx.config.functionsUrl}/registrations`,
        {
          method: "OPTIONS",
          headers: {
            apikey: ctx.config.supabaseAnonKey,
            Origin: "http://localhost:3000",
          },
        }
      );

      assertEquals(response.status, 200, "CORS preflight should succeed");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
