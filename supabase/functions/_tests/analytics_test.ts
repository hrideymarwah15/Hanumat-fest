/**
 * Analytics Edge Function Tests
 * 
 * Tests for analytics endpoints (Admin only):
 * - GET /analytics/dashboard - Dashboard stats
 * - GET /analytics/sports - Sport-wise analytics
 * - GET /analytics/colleges - College-wise analytics
 * - GET /analytics/revenue - Revenue analytics
 * - GET /analytics/trends - Registration trends
 * - GET /analytics/:sport_id - Single sport analytics
 */

import {
  assertEquals,
  assertExists,
  assert,
  request,
  assertSuccess,
  assertError,
  assertForbidden,
  createTestContext,
  cleanupTestContext,
  setupTestUser,
  setupAdminUser,
  generateMockSportData,
  TestContext,
} from "./test_utils.ts";

// Helper to create test sport
async function createTestSport(ctx: TestContext) {
  if (!ctx.adminUser) {
    await setupAdminUser(ctx);
  }

  const response = await request(ctx.config, "sports", "", {
    method: "POST",
    accessToken: ctx.adminUser!.accessToken,
    body: {
      ...generateMockSportData(),
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
  userToken: string
) {
  const response = await request(ctx.config, "registrations", "", {
    method: "POST",
    accessToken: userToken,
    body: { sport_id: sportId },
  });

  if (response.data.success && response.data.data?.registration?.id) {
    ctx.createdResources.registrations.push(response.data.data.registration.id);
  }

  return response.data.data?.registration;
}

// =============================================================================
// TEST: GET /analytics/dashboard - Dashboard Stats
// =============================================================================

Deno.test({
  name: "Analytics: GET /dashboard - should return dashboard stats for admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "analytics", "dashboard", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.stats, "Stats should exist");
      assertExists(
        response.data.data?.recent_registrations,
        "Recent registrations should exist"
      );
      assertExists(
        response.data.data?.recent_payments,
        "Recent payments should exist"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /dashboard - should include stats fields",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "analytics", "dashboard", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      const stats = response.data.data?.stats;
      
      // Check for expected stats fields - use explicit undefined check for zero values
      assert(stats?.total_registrations !== undefined, "Should have total_registrations");
      assert(stats?.total_sports !== undefined, "Should have total_sports");
      assert(stats?.total_revenue !== undefined, "Should have total_revenue");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /dashboard - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "analytics", "dashboard", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /analytics/sports - Sport-wise Analytics
// =============================================================================

Deno.test({
  name: "Analytics: GET /sports - should return sport analytics for admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      // Create a sport first
      await createTestSport(ctx);

      const response = await request(ctx.config, "analytics", "sports", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.sports, "Sports should exist");
      assert(
        Array.isArray(response.data.data?.sports),
        "Sports should be an array"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /sports - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "analytics", "sports", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /analytics/colleges - College-wise Analytics
// =============================================================================

Deno.test({
  name: "Analytics: GET /colleges - should return college analytics for admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "analytics", "colleges", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.colleges, "Colleges should exist");
      assert(
        Array.isArray(response.data.data?.colleges),
        "Colleges should be an array"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /colleges - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "analytics", "colleges", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /analytics/revenue - Revenue Analytics
// =============================================================================

Deno.test({
  name: "Analytics: GET /revenue - should return revenue analytics for admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "analytics", "revenue", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.revenue, "Revenue should exist");
      assertExists(response.data.data?.summary, "Summary should exist");
      assert(
        response.data.data?.summary?.total_revenue !== undefined,
        "Total revenue should exist"
      );
      assert(
        response.data.data?.summary?.total_transactions !== undefined,
        "Total transactions should exist"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /revenue - should support period parameter",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      // Test daily period
      const dailyResponse = await request(
        ctx.config,
        "analytics",
        "revenue?period=daily",
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(dailyResponse);
      assertEquals(
        dailyResponse.data.data?.summary?.period,
        "daily",
        "Period should be daily"
      );

      // Test weekly period
      const weeklyResponse = await request(
        ctx.config,
        "analytics",
        "revenue?period=weekly",
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(weeklyResponse);
      assertEquals(
        weeklyResponse.data.data?.summary?.period,
        "weekly",
        "Period should be weekly"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /revenue - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "analytics", "revenue", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /analytics/trends - Registration Trends
// =============================================================================

Deno.test({
  name: "Analytics: GET /trends - should return registration trends for admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "analytics", "trends", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.trends, "Trends should exist");
      assert(
        Array.isArray(response.data.data?.trends),
        "Trends should be an array"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /trends - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "analytics", "trends", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertForbidden(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /analytics/:sport_id - Single Sport Analytics
// =============================================================================

Deno.test({
  name: "Analytics: GET /:sport_id - should return analytics for specific sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const sport = await createTestSport(ctx);

      const response = await request(
        ctx.config,
        "analytics",
        sport.id,
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertExists(response.data.data?.analytics, "Analytics should exist");
      assertExists(
        response.data.data?.college_breakdown,
        "College breakdown should exist"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /:sport_id - should include registration data",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      // Create a registration
      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(
        ctx.config,
        "analytics",
        sport.id,
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      const collegeBreakdown = response.data.data?.college_breakdown || {};
      
      // Should have at least one college entry
      assert(
        Object.keys(collegeBreakdown).length >= 1,
        "Should have college breakdown data"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Analytics: GET /:sport_id - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);

      const response = await request(
        ctx.config,
        "analytics",
        sport.id,
        {
          method: "GET",
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
// General Error Handling Tests
// =============================================================================

Deno.test({
  name: "Analytics: should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "analytics", "dashboard", {
        method: "GET",
        // No access token
      });

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
  name: "Analytics: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(
        `${ctx.config.functionsUrl}/analytics/dashboard`,
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
