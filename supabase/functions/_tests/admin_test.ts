/**
 * Admin Edge Function Tests
 * 
 * Tests for admin-only endpoints:
 * - GET /admin/audit-logs - View audit logs
 * - GET/POST/PATCH/DELETE /admin/colleges - Manage colleges
 * - GET/PATCH /admin/settings - Manage settings
 * - GET/PATCH /admin/registrations - Manage registrations
 * - POST /admin/registrations/bulk-update - Bulk update registrations
 * - GET /admin/registrations/export - Export registrations
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
  dbInsert,
  dbDelete,
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
// TEST: GET /admin/audit-logs - Audit Logs
// =============================================================================

Deno.test({
  name: "Admin: GET /audit-logs - should return audit logs for admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      // Create some actions to generate audit logs
      await createTestSport(ctx);

      const response = await request(ctx.config, "admin", "audit-logs", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.logs, "Logs should exist");
      assert(
        Array.isArray(response.data.data?.logs),
        "Logs should be an array"
      );
      assertExists(response.data.data?.total, "Total should exist");
      assertExists(response.data.data?.page, "Page should exist");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: GET /audit-logs - should filter by entity_type",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "admin",
        "audit-logs?entity_type=sports",
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      const logs = response.data.data?.logs || [];
      
      for (const log of logs) {
        assertEquals(
          log.entity_type,
          "sports",
          "Should only return sports logs"
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
  name: "Admin: GET /audit-logs - should support pagination",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "admin",
        "audit-logs?page=1&limit=5",
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(response.data.data?.page, 1, "Page should be 1");
      assertEquals(response.data.data?.limit, 5, "Limit should be 5");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: GET /audit-logs - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "admin", "audit-logs", {
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
// TEST: Colleges CRUD
// =============================================================================

Deno.test({
  name: "Admin: GET /colleges - should return colleges list",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "admin", "colleges", {
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
  name: "Admin: POST /colleges - should create a new college",
  async fn() {
    const ctx = createTestContext();
    let collegeId: string | null = null;

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "admin", "colleges", {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
        body: {
          name: `Test College ${Date.now()}`,
          short_name: "TC",
          city: "Test City",
        },
      });

      assertSuccess(response);
      assertExists(response.data.data?.id, "College ID should exist");
      assertExists(response.data.data?.name, "Name should exist");

      collegeId = response.data.data?.id;
    } finally {
      // Cleanup
      if (collegeId) {
        await dbDelete(ctx.config, "colleges", `id=eq.${collegeId}`);
      }
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: POST /colleges - should reject duplicate name",
  async fn() {
    const ctx = createTestContext();
    let collegeId: string | null = null;

    try {
      await setupAdminUser(ctx);

      const collegeName = `Unique College ${Date.now()}`;

      // Create first college
      const response1 = await request(ctx.config, "admin", "colleges", {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
        body: { name: collegeName },
      });

      assertSuccess(response1);
      collegeId = response1.data.data?.id;

      // Try to create duplicate
      const response2 = await request(ctx.config, "admin", "colleges", {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
        body: { name: collegeName },
      });

      assertError(response2, 409, "already exists");
    } finally {
      if (collegeId) {
        await dbDelete(ctx.config, "colleges", `id=eq.${collegeId}`);
      }
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: POST /colleges - should reject missing name",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "admin", "colleges", {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
        body: { city: "Test City" }, // Missing name
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
  name: "Admin: PATCH /colleges/:id - should update college",
  async fn() {
    const ctx = createTestContext();
    let collegeId: string | null = null;

    try {
      await setupAdminUser(ctx);

      // Create college first
      const createResponse = await request(ctx.config, "admin", "colleges", {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
        body: { name: `College to Update ${Date.now()}` },
      });

      collegeId = createResponse.data.data?.id;

      // Update it
      const response = await request(
        ctx.config,
        "admin",
        `colleges/${collegeId}`,
        {
          method: "PATCH",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            short_name: "UPDATED",
            city: "New City",
          },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.short_name,
        "UPDATED",
        "Short name should be updated"
      );
      assertEquals(
        response.data.data?.city,
        "New City",
        "City should be updated"
      );
    } finally {
      if (collegeId) {
        await dbDelete(ctx.config, "colleges", `id=eq.${collegeId}`);
      }
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: DELETE /colleges/:id - should soft delete college",
  async fn() {
    const ctx = createTestContext();
    let collegeId: string | null = null;

    try {
      await setupAdminUser(ctx);

      // Create college first
      const createResponse = await request(ctx.config, "admin", "colleges", {
        method: "POST",
        accessToken: ctx.adminUser!.accessToken,
        body: { name: `College to Delete ${Date.now()}` },
      });

      collegeId = createResponse.data.data?.id;

      // Delete it
      const response = await request(
        ctx.config,
        "admin",
        `colleges/${collegeId}`,
        {
          method: "DELETE",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.is_active,
        false,
        "Should be soft deleted"
      );
    } finally {
      if (collegeId) {
        await dbDelete(ctx.config, "colleges", `id=eq.${collegeId}`);
      }
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: Colleges - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "admin", "colleges", {
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
// TEST: Settings
// =============================================================================

Deno.test({
  name: "Admin: GET /settings - should return settings",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "admin", "settings", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.settings, "Settings should exist");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: PATCH /settings - should update settings",
  async fn() {
    const ctx = createTestContext();
    const testKey = `_test_setting_${Date.now()}`; // Unique test key

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "admin", "settings", {
        method: "PATCH",
        accessToken: ctx.adminUser!.accessToken,
        body: {
          [testKey]: "test_value",
        },
      });

      assertSuccess(response);
      assertEquals(
        response.data.data?.message,
        "Settings updated successfully",
        "Should confirm update"
      );
    } finally {
      // Cleanup: delete the test setting
      try {
        await dbDelete(ctx.config, "settings", `key=eq.${testKey}`);
      } catch (_e) {
        // Ignore cleanup errors
      }
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: Settings - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "admin", "settings", {
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
// TEST: Admin Registrations
// =============================================================================

Deno.test({
  name: "Admin: GET /registrations - should return all registrations",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(ctx.config, "admin", "registrations", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
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
      assertExists(response.data.data?.total, "Total should exist");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: GET /registrations - should filter by sport_id",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(
        ctx.config,
        "admin",
        `registrations?sport_id=${sport.id}`,
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      const registrations = response.data.data?.registrations || [];
      
      for (const reg of registrations) {
        assertEquals(
          reg.sport_id,
          sport.id,
          "Should filter by sport"
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
  name: "Admin: GET /registrations - should filter by status",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(
        ctx.config,
        "admin",
        "registrations?status=payment_pending",
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      const registrations = response.data.data?.registrations || [];
      
      for (const reg of registrations) {
        assertEquals(
          reg.status,
          "payment_pending",
          "Should filter by status"
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
  name: "Admin: PATCH /registrations/:id - should update registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      const registration = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );

      const response = await request(
        ctx.config,
        "admin",
        `registrations/${registration.id}`,
        {
          method: "PATCH",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            status: "confirmed",
            notes: "Admin verified",
          },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.status,
        "confirmed",
        "Status should be updated"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: POST /registrations/bulk-update - should bulk update registrations",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      const registration = await createTestRegistration(
        ctx,
        sport.id,
        user.accessToken
      );

      const response = await request(
        ctx.config,
        "admin",
        "registrations/bulk-update",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_ids: [registration.id],
            status: "confirmed",
            reason: "Bulk confirmation",
          },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.updated,
        1,
        "Should update 1 registration"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: POST /registrations/bulk-update - should reject invalid status",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "admin",
        "registrations/bulk-update",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_ids: ["some-id"],
            status: "invalid_status",
          },
        }
      );

      assertError(response, 400, "Invalid status");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: POST /registrations/bulk-update - should reject empty IDs",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "admin",
        "registrations/bulk-update",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_ids: [],
            status: "confirmed",
          },
        }
      );

      assertError(response, 400, "No registration IDs");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: Export Registrations
// =============================================================================

Deno.test({
  name: "Admin: GET /registrations/export - should export as JSON",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "admin",
        "registrations/export?format=json",
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
      assertExists(
        response.data.data?.registrations,
        "Registrations should exist"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: GET /registrations/export - should export as CSV",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await fetch(
        `${ctx.config.functionsUrl}/admin/registrations/export?format=csv`,
        {
          method: "GET",
          headers: {
            apikey: ctx.config.supabaseAnonKey,
            Authorization: `Bearer ${ctx.adminUser!.accessToken}`,
          },
        }
      );

      assertEquals(response.status, 200, "Should return 200");
      assertEquals(
        response.headers.get("Content-Type"),
        "text/csv",
        "Should be CSV content type"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: GET /registrations/export - should filter export by sport",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      await createTestRegistration(ctx, sport.id, user.accessToken);

      const response = await request(
        ctx.config,
        "admin",
        `registrations/export?sport_id=${sport.id}&format=json`,
        {
          method: "GET",
          accessToken: ctx.adminUser!.accessToken,
        }
      );

      assertSuccess(response);
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Admin: Registrations - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "admin", "registrations", {
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
// CORS and Error Tests
// =============================================================================

Deno.test({
  name: "Admin: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(`${ctx.config.functionsUrl}/admin/colleges`, {
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
  name: "Admin: should return 404 for unknown routes",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(ctx.config, "admin", "unknown-resource", {
        method: "GET",
        accessToken: ctx.adminUser!.accessToken,
      });

      assertEquals(response.status, 404, "Should return 404");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
