/**
 * Notifications Edge Function Tests
 * 
 * Tests for notification management endpoints:
 * - GET /notifications - List notifications
 * - GET /notifications/unread-count - Get unread count
 * - POST /notifications/mark-read - Mark as read
 * - POST /notifications/broadcast - Broadcast notification (admin)
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
  dbInsert,
  TestContext,
} from "./test_utils.ts";

// Helper to create a test notification
async function createTestNotification(
  ctx: TestContext,
  recipientId: string,
  data: {
    title?: string;
    message?: string;
    type?: string;
  } = {}
) {
  return await dbInsert(ctx.config, "notifications", {
    recipient_id: recipientId,
    type: data.type || "announcement",
    title: data.title || "Test Notification",
    message: data.message || "This is a test notification",
    is_read: false,
  });
}

// =============================================================================
// TEST: GET /notifications - List Notifications
// =============================================================================

Deno.test({
  name: "Notifications: GET / - should return user's notifications",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create some test notifications
      await createTestNotification(ctx, user.id, { title: "Notification 1" });
      await createTestNotification(ctx, user.id, { title: "Notification 2" });

      const response = await request(ctx.config, "notifications", "", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertExists(
        response.data.data?.notifications,
        "Notifications should exist"
      );
      assert(
        Array.isArray(response.data.data?.notifications),
        "Notifications should be an array"
      );
      assert(
        response.data.data?.notifications.length >= 2,
        "Should have at least 2 notifications"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: GET / - should filter unread only",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create notifications
      await createTestNotification(ctx, user.id);

      const response = await request(
        ctx.config,
        "notifications",
        "?unread_only=true",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      const notifications = response.data.data?.notifications || [];
      
      for (const notif of notifications) {
        assertEquals(notif.is_read, false, "Should only return unread");
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: GET / - should support pagination with limit",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create multiple notifications
      for (let i = 0; i < 10; i++) {
        await createTestNotification(ctx, user.id, { title: `Notification ${i}` });
      }

      const response = await request(
        ctx.config,
        "notifications",
        "?limit=5",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.notifications?.length,
        5,
        "Should return 5 notifications"
      );
      assertExists(
        response.data.data?.next_cursor,
        "Should have next_cursor for pagination"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: GET / - should support cursor pagination",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create multiple notifications
      for (let i = 0; i < 10; i++) {
        await createTestNotification(ctx, user.id, { title: `Notification ${i}` });
      }

      // First page
      const response1 = await request(
        ctx.config,
        "notifications",
        "?limit=5",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response1);
      const cursor = response1.data.data?.next_cursor;

      // Second page
      const response2 = await request(
        ctx.config,
        "notifications",
        `?limit=5&cursor=${cursor}`,
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response2);
      
      // Ensure different notifications
      const ids1 = response1.data.data?.notifications?.map((n: { id: string }) => n.id) || [];
      const ids2 = response2.data.data?.notifications?.map((n: { id: string }) => n.id) || [];
      
      const overlap = ids1.filter((id: string) => ids2.includes(id));
      assertEquals(overlap.length, 0, "Pages should not overlap");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: GET / - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "notifications", "", {
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
// TEST: GET /notifications/unread-count - Get Unread Count
// =============================================================================

Deno.test({
  name: "Notifications: GET /unread-count - should return unread count",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create unread notifications
      await createTestNotification(ctx, user.id);
      await createTestNotification(ctx, user.id);
      await createTestNotification(ctx, user.id);

      const response = await request(
        ctx.config,
        "notifications",
        "unread-count",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertExists(
        response.data.data?.unread_count,
        "Unread count should exist"
      );
      assert(
        response.data.data?.unread_count >= 3,
        "Should have at least 3 unread"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: GET /unread-count - should return 0 when no unread",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Don't create any notifications

      const response = await request(
        ctx.config,
        "notifications",
        "unread-count",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.unread_count,
        0,
        "Should return 0 unread"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: GET /unread-count - should reject unauthenticated",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(
        ctx.config,
        "notifications",
        "unread-count",
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

// =============================================================================
// TEST: POST /notifications/mark-read - Mark as Read
// =============================================================================

Deno.test({
  name: "Notifications: POST /mark-read - should mark all as read",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create unread notifications
      await createTestNotification(ctx, user.id);
      await createTestNotification(ctx, user.id);

      // Mark all as read (no specific IDs)
      const response = await request(
        ctx.config,
        "notifications",
        "mark-read",
        {
          method: "POST",
          accessToken: user.accessToken,
          body: {},
        }
      );

      assertSuccess(response);

      // Verify unread count is 0
      const countResponse = await request(
        ctx.config,
        "notifications",
        "unread-count",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertEquals(
        countResponse.data.data?.unread_count,
        0,
        "Unread count should be 0"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: POST /mark-read - should mark specific notifications",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      // Create unread notifications
      const notif1 = await createTestNotification(ctx, user.id);
      const notif2 = await createTestNotification(ctx, user.id);
      await createTestNotification(ctx, user.id); // notif3 stays unread

      // Mark only notif1 and notif2 as read
      const response = await request(
        ctx.config,
        "notifications",
        "mark-read",
        {
          method: "POST",
          accessToken: user.accessToken,
          body: {
            notification_ids: [notif1.id, notif2.id],
          },
        }
      );

      assertSuccess(response);

      // Verify 1 still unread
      const countResponse = await request(
        ctx.config,
        "notifications",
        "unread-count",
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertEquals(
        countResponse.data.data?.unread_count,
        1,
        "Should have 1 unread"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: POST /mark-read - should reject unauthenticated",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(
        ctx.config,
        "notifications",
        "mark-read",
        {
          method: "POST",
          body: {},
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

// =============================================================================
// TEST: POST /notifications/broadcast - Broadcast Notification (Admin)
// =============================================================================

Deno.test({
  name: "Notifications: POST /broadcast - should broadcast to all users as admin",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "notifications",
        "broadcast",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            title: "Test Broadcast",
            message: "This is a test broadcast message",
            priority: "high",
            target: {
              type: "all",
            },
          },
        }
      );

      assertSuccess(response);
      assertExists(response.data.data?.count, "Count should exist");
      assert(response.data.data?.count >= 1, "Should broadcast to at least 1 user");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: POST /broadcast - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "notifications",
        "broadcast",
        {
          method: "POST",
          accessToken: user.accessToken,
          body: {
            title: "Hacked Broadcast",
            message: "This should fail",
          },
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
  name: "Notifications: POST /broadcast - should reject missing fields",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "notifications",
        "broadcast",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            // Missing title and message
          },
        }
      );

      assertError(response, 400, "Missing required fields");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Notifications: POST /broadcast - should broadcast by college",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "notifications",
        "broadcast",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            title: "College Broadcast",
            message: "Message for specific college",
            target: {
              type: "college",
              value: user.college,
            },
          },
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

// =============================================================================
// CORS Tests
// =============================================================================

Deno.test({
  name: "Notifications: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(
        `${ctx.config.functionsUrl}/notifications`,
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
