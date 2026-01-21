/**
 * Sports Edge Function Tests
 * 
 * Tests for sports management endpoints:
 * - GET /sports - List sports
 * - GET /sports/:id - Get sport details
 * - POST /sports - Create sport (admin)
 * - PATCH /sports/:id - Update sport (admin)
 * - POST /sports/:id/toggle-registration - Toggle registration (admin)
 * - POST /sports/:id/duplicate - Duplicate sport (admin)
 * - POST /sports/:id/archive - Archive sport (admin)
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
  dbInsert,
  dbDelete,
  TestContext,
} from "./test_utils.ts";

// Helper to create a test sport via admin
async function createTestSport(ctx: TestContext, sportData?: Record<string, unknown>) {
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

  return response;
}

// =============================================================================
// TEST: GET /sports - List Sports
// =============================================================================

Deno.test({
  name: "Sports: GET / - should list all non-archived sports",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      
      // Create a test sport first
      await createTestSport(ctx);

      const response = await request(ctx.config, "sports", "", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.sports, "Sports array should exist");
      assert(
        Array.isArray(response.data.data?.sports),
        "Sports should be an array"
      );
      assertExists(response.data.data?.total, "Total count should exist");
      assertExists(response.data.data?.page, "Page should exist");
      assertExists(response.data.data?.limit, "Limit should exist");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: GET / - should filter by category",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create sports with different categories
      await createTestSport(ctx, { ...generateMockSportData(), category: "indoor" });
      await createTestSport(ctx, { ...generateMockSportData(), category: "outdoor" });

      const response = await request(ctx.config, "sports", "?category=indoor", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      
      // All returned sports should be indoor
      const sports = response.data.data?.sports || [];
      for (const sport of sports) {
        assertEquals(sport.category, "indoor", "Should only return indoor sports");
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: GET / - should filter by is_open",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "sports", "?is_open=true", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      
      const sports = response.data.data?.sports || [];
      for (const sport of sports) {
        assertEquals(
          sport.is_registration_open,
          true,
          "Should only return open sports"
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
  name: "Sports: GET / - should search by name",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      
      // Create a sport with a unique name
      const uniqueName = `UniqueTestSport_${Date.now()}`;
      await createTestSport(ctx, { ...generateMockSportData(), name: uniqueName });

      const response = await request(ctx.config, "sports", `?search=${uniqueName}`, {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      
      const sports = response.data.data?.sports || [];
      assert(sports.length > 0, "Should find the sport");
      assert(
        sports.some((s: { name: string }) => s.name.includes(uniqueName)),
        "Should return matching sport"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: GET / - should paginate results",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "sports", "?page=1&limit=5", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertEquals(response.data.data?.page, 1, "Page should be 1");
      assertEquals(response.data.data?.limit, 5, "Limit should be 5");
      assert(
        (response.data.data?.sports || []).length <= 5,
        "Should return max 5 sports"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /sports/:id - Get Sport Details
// =============================================================================

Deno.test({
  name: "Sports: GET /:id - should return sport details by ID",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;

      const response = await request(ctx.config, "sports", sportId, {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.sport, "Sport should exist");
      assertEquals(
        response.data.data?.sport?.id,
        sportId,
        "Should return correct sport"
      );
      assertExists(
        response.data.data?.applicable_fees,
        "Applicable fees should exist"
      );
      assertExists(
        response.data.data?.can_register,
        "can_register should exist"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: GET /:slug - should return sport details by slug",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      
      const createResponse = await createTestSport(ctx);
      const sport = createResponse.data.data;

      assertExists(sport?.slug, "Sport should have a slug");

      const response = await request(ctx.config, "sports", sport.slug, {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.sport?.id,
        sport.id,
        "Should return correct sport"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: GET /:id - should return 404 for non-existent sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "sports",
        "00000000-0000-0000-0000-000000000000",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertError(response, 404, "Sport not found");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: POST /sports - Create Sport (Admin Only)
// =============================================================================

Deno.test({
  name: "Sports: POST / - should create sport as admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const admin = await setupAdminUser(ctx);
      const sportData = generateMockSportData();

      const response = await request(ctx.config, "sports", "", {
        method: "POST",
        accessToken: admin.accessToken,
        body: sportData,
      });

      assertSuccess(response);
      assertExists(response.data.data?.id, "Sport ID should exist");
      assertEquals(
        response.data.data?.name,
        sportData.name,
        "Name should match"
      );
      assertExists(response.data.data?.slug, "Slug should be generated");

      if (response.data.data?.id) {
        ctx.createdResources.sports.push(response.data.data.id);
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: POST / - should reject non-admin user",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sportData = generateMockSportData();

      const response = await request(ctx.config, "sports", "", {
        method: "POST",
        accessToken: user.accessToken,
        body: sportData,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: POST / - should reject missing required fields",
  async fn() {
    const ctx = createTestContext();

    try {
      const admin = await setupAdminUser(ctx);

      const response = await request(ctx.config, "sports", "", {
        method: "POST",
        accessToken: admin.accessToken,
        body: {
          name: "Test Sport",
          // Missing category, fees, registration_start, registration_deadline
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
  name: "Sports: POST / - should reject invalid category",
  async fn() {
    const ctx = createTestContext();

    try {
      const admin = await setupAdminUser(ctx);
      const sportData = {
        ...generateMockSportData(),
        category: "invalid_category",
      };

      const response = await request(ctx.config, "sports", "", {
        method: "POST",
        accessToken: admin.accessToken,
        body: sportData,
      });

      assertError(response, 400, "Invalid category");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: POST / - should reject deadline before start date",
  async fn() {
    const ctx = createTestContext();

    try {
      const admin = await setupAdminUser(ctx);
      const now = new Date();
      const sportData = {
        ...generateMockSportData(),
        registration_start: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
        registration_deadline: now.toISOString(), // Today (before start)
      };

      const response = await request(ctx.config, "sports", "", {
        method: "POST",
        accessToken: admin.accessToken,
        body: sportData,
      });

      assertError(response, 400, "deadline must be after");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: POST / - should create team sport with team settings",
  async fn() {
    const ctx = createTestContext();

    try {
      const admin = await setupAdminUser(ctx);
      const sportData = generateMockTeamSportData();

      const response = await request(ctx.config, "sports", "", {
        method: "POST",
        accessToken: admin.accessToken,
        body: sportData,
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.is_team_event,
        true,
        "Should be a team event"
      );
      assertEquals(
        response.data.data?.team_size_min,
        sportData.team_size_min,
        "Min team size should match"
      );
      assertEquals(
        response.data.data?.team_size_max,
        sportData.team_size_max,
        "Max team size should match"
      );

      if (response.data.data?.id) {
        ctx.createdResources.sports.push(response.data.data.id);
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: PATCH /sports/:id - Update Sport (Admin Only)
// =============================================================================

Deno.test({
  name: "Sports: PATCH /:id - should update sport as admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;

      const updates = {
        name: "Updated Sport Name",
        fees: 200,
        venue: "Updated Venue",
      };

      const response = await request(ctx.config, "sports", sportId, {
        method: "PATCH",
        accessToken: ctx.adminUser!.accessToken,
        body: updates,
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.name,
        updates.name,
        "Name should be updated"
      );
      assertEquals(
        response.data.data?.fees,
        updates.fees,
        "Fees should be updated"
      );
      assertEquals(
        response.data.data?.venue,
        updates.venue,
        "Venue should be updated"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: PATCH /:id - should reject non-admin user",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;

      const response = await request(ctx.config, "sports", sportId, {
        method: "PATCH",
        accessToken: user.accessToken,
        body: { name: "Hacked Name" },
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: PATCH /:id - should return 404 for non-existent sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const admin = await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "sports",
        "00000000-0000-0000-0000-000000000000",
        {
          method: "PATCH",
          accessToken: admin.accessToken,
          body: { name: "Updated" },
        }
      );

      assertError(response, 404, "Sport not found");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: POST /sports/:id/toggle-registration - Toggle Registration
// =============================================================================

Deno.test({
  name: "Sports: POST /:id/toggle-registration - should toggle registration status",
  async fn() {
    const ctx = createTestContext();

    try {
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;
      const wasOpen = createResponse.data.data?.is_registration_open;

      const response = await request(
        ctx.config,
        "sports",
        `${sportId}/toggle-registration`,
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.is_registration_open,
        !wasOpen,
        "Registration status should toggle"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: POST /:id/toggle-registration - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;

      const response = await request(
        ctx.config,
        "sports",
        `${sportId}/toggle-registration`,
        {
          method: "POST",
          accessToken: user.accessToken,
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
// TEST: POST /sports/:id/duplicate - Duplicate Sport
// =============================================================================

Deno.test({
  name: "Sports: POST /:id/duplicate - should duplicate sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;
      const originalName = createResponse.data.data?.name;

      const response = await request(
        ctx.config,
        "sports",
        `${sportId}/duplicate`,
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assert(
        response.data.data?.name?.includes("(Copy)"),
        "Duplicate name should include (Copy)"
      );
      assertEquals(
        response.data.data?.is_registration_open,
        false,
        "Duplicate should have registration closed"
      );
      assertEquals(
        response.data.data?.current_participants,
        0,
        "Duplicate should have 0 participants"
      );

      // Track duplicate for cleanup
      if (response.data.data?.id) {
        ctx.createdResources.sports.push(response.data.data.id);
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: POST /sports/:id/archive - Archive Sport
// =============================================================================

Deno.test({
  name: "Sports: POST /:id/archive - should archive sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;

      const response = await request(
        ctx.config,
        "sports",
        `${sportId}/archive`,
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.is_archived,
        true,
        "Sport should be archived"
      );
      assertEquals(
        response.data.data?.is_registration_open,
        false,
        "Registration should be closed"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: POST /:id/archive - archived sport should not appear in listing",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const createResponse = await createTestSport(ctx);
      const sportId = createResponse.data.data?.id;

      // Archive the sport
      await request(ctx.config, "sports", `${sportId}/archive`, {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
      });

      // List sports
      const listResponse = await request(ctx.config, "sports", "", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(listResponse);
      
      const sports = listResponse.data.data?.sports || [];
      const archivedSport = sports.find((s: { id: string }) => s.id === sportId);
      assertEquals(archivedSport, undefined, "Archived sport should not appear in listing");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// CORS and Error Handling Tests
// =============================================================================

Deno.test({
  name: "Sports: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(`${ctx.config.functionsUrl}/sports`, {
        method: "OPTIONS",
        headers: {
          apikey: ctx.config.supabaseAnonKey,
          Origin: "http://localhost:3000",
        },
      });

      assertEquals(response.status, 200, "CORS preflight should succeed");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Sports: should return 404 for unknown routes",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "sports",
        "some-id/unknown-action",
        {
          method: "POST",
          accessToken: user.accessToken,
        }
      );

      assertEquals(response.status, 404, "Should return 404 for unknown action");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
