/**
 * Payments Edge Function Tests
 * 
 * Tests for payment management endpoints:
 * - POST /payments/create-order - Create Razorpay order
 * - POST /payments/verify - Verify Razorpay payment
 * - POST /payments/verify-offline - Verify offline payment (admin)
 * - POST /payments/:id/refund - Process refund (admin)
 * - GET /payments/me - Get user's payments
 * - GET /payments/:id/receipt - Get payment receipt
 * 
 * Note: Webhook tests are included but may need a mock server in production
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
  dbQuery,
  TestContext,
} from "./test_utils.ts";

// Helper to create a test sport via admin
async function createTestSport(ctx: TestContext) {
  const data = generateMockSportData();

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
// TEST: POST /payments/create-order - Create Razorpay Order
// =============================================================================

Deno.test({
  name: "Payments: POST /create-order - should create order for valid registration",
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

      const response = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: { registration_id: registration.id },
      });

      assertSuccess(response);
      assertExists(response.data.data?.order_id, "Order ID should exist");
      assertExists(response.data.data?.amount, "Amount should exist");
      assertExists(response.data.data?.currency, "Currency should exist");
      assertExists(response.data.data?.key_id, "Key ID should exist");
      assertExists(response.data.data?.prefill, "Prefill data should exist");
      
      // Verify amount is in paise (100x the sport fee)
      assertEquals(
        response.data.data?.amount,
        sport.fees * 100,
        "Amount should be in paise"
      );
      assertEquals(
        response.data.data?.currency,
        "INR",
        "Currency should be INR"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /create-order - should return existing order if pending",
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

      // Create first order
      const response1 = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: { registration_id: registration.id },
      });

      // Create second order - should return the same
      const response2 = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: { registration_id: registration.id },
      });

      assertSuccess(response1);
      assertSuccess(response2);
      assertEquals(
        response1.data.data?.order_id,
        response2.data.data?.order_id,
        "Should return same order ID"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /create-order - should reject missing registration_id",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: {},
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
  name: "Payments: POST /create-order - should reject non-existent registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: { registration_id: "00000000-0000-0000-0000-000000000000" },
      });

      assertError(response, 404, "Registration not found");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /create-order - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        body: { registration_id: "some-id" },
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
  name: "Payments: POST /create-order - should reject other user's registration",
  async fn() {
    const ctx = createTestContext();

    try {
      const user1 = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      const registration = await createTestRegistration(
        ctx,
        sport.id,
        user1.accessToken
      );

      // Create another user
      const user2Data = {
        email: `test_${Date.now()}_5@example.com`,
        password: "TestPass123!",
        name: "Test User 5",
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

      // Try to create order for user1's registration as user2
      const response = await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: signupResponse.data.data?.user?.access_token,
        body: { registration_id: registration.id },
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
// TEST: POST /payments/verify - Verify Razorpay Payment
// =============================================================================

Deno.test({
  name: "Payments: POST /verify - should reject missing fields",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "payments", "verify", {
        method: "POST",
        accessToken: user.accessToken,
        body: {
          razorpay_order_id: "order_123",
          // Missing payment_id and signature
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
  name: "Payments: POST /verify - should reject invalid signature",
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

      // Create order first
      const orderResponse = await request(
        ctx.config,
        "payments",
        "create-order",
        {
          method: "POST",
          accessToken: user.accessToken,
          body: { registration_id: registration.id },
        }
      );

      // Try to verify with invalid signature
      const response = await request(ctx.config, "payments", "verify", {
        method: "POST",
        accessToken: user.accessToken,
        body: {
          razorpay_order_id: orderResponse.data.data?.order_id,
          razorpay_payment_id: "pay_invalid123",
          razorpay_signature: "invalid_signature",
        },
      });

      assertError(response, 400, "Payment verification failed");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /verify - should reject non-existent order",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(ctx.config, "payments", "verify", {
        method: "POST",
        accessToken: user.accessToken,
        body: {
          razorpay_order_id: "order_nonexistent",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "signature_123",
        },
      });

      assertError(response, 404, "Payment not found");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /verify - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "payments", "verify", {
        method: "POST",
        body: {
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "sig_123",
        },
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
// TEST: POST /payments/verify-offline - Verify Offline Payment (Admin)
// =============================================================================

Deno.test({
  name: "Payments: POST /verify-offline - should verify offline payment as admin",
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
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: registration.id,
            amount: sport.fees,
            verification_note: "Cash payment received",
          },
        }
      );

      assertSuccess(response);
      assertExists(response.data.data?.payment, "Payment should exist");
      assertEquals(
        response.data.data?.payment?.method,
        "offline",
        "Method should be offline"
      );
      assertEquals(
        response.data.data?.payment?.status,
        "success",
        "Status should be success"
      );
      assertExists(
        response.data.data?.registration,
        "Updated registration should exist"
      );

      // Track payment for cleanup
      if (response.data.data?.payment?.id) {
        ctx.createdResources.payments.push(response.data.data.payment.id);
      }
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /verify-offline - should reject non-admin",
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
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: user.accessToken, // Regular user, not admin
          body: {
            registration_id: registration.id,
            amount: sport.fees,
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
  name: "Payments: POST /verify-offline - should reject missing fields",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            // Missing registration_id and amount
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
  name: "Payments: POST /verify-offline - should reject non-existent registration",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: "00000000-0000-0000-0000-000000000000",
            amount: 100,
          },
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
// TEST: POST /payments/:id/refund - Process Refund (Admin)
// =============================================================================

Deno.test({
  name: "Payments: POST /:id/refund - should process offline refund as admin",
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

      // First verify offline payment
      const paymentResponse = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: registration.id,
            amount: sport.fees,
          },
        }
      );

      const paymentId = paymentResponse.data.data?.payment?.id;
      if (paymentId) {
        ctx.createdResources.payments.push(paymentId);
      }

      // Process refund
      const response = await request(
        ctx.config,
        "payments",
        `${paymentId}/refund`,
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            amount: sport.fees,
            reason: "Test refund",
          },
        }
      );

      assertSuccess(response);
      assertEquals(
        response.data.data?.status,
        "refunded",
        "Status should be refunded"
      );
      assertEquals(
        response.data.data?.refund_amount,
        sport.fees,
        "Refund amount should match"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /:id/refund - should reject non-admin",
  async fn() {
    const ctx = createTestContext();

    try {
      const user = await setupTestUser(ctx);

      const response = await request(
        ctx.config,
        "payments",
        "some-payment-id/refund",
        {
          method: "POST",
          accessToken: user.accessToken,
          body: {
            amount: 100,
            reason: "Test",
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
  name: "Payments: POST /:id/refund - should reject missing fields",
  async fn() {
    const ctx = createTestContext();

    try {
      await setupAdminUser(ctx);

      const response = await request(
        ctx.config,
        "payments",
        "some-payment-id/refund",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            // Missing amount and reason
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
  name: "Payments: POST /:id/refund - should reject refund exceeding payment amount",
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

      // First verify offline payment
      const paymentResponse = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: registration.id,
            amount: sport.fees,
          },
        }
      );

      const paymentId = paymentResponse.data.data?.payment?.id;
      if (paymentId) {
        ctx.createdResources.payments.push(paymentId);
      }

      // Try to refund more than payment amount
      const response = await request(
        ctx.config,
        "payments",
        `${paymentId}/refund`,
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            amount: sport.fees * 2, // Double the amount
            reason: "Test refund",
          },
        }
      );

      assertError(response, 400, "Refund amount cannot exceed");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

// =============================================================================
// TEST: GET /payments/me - Get User's Payments
// =============================================================================

Deno.test({
  name: "Payments: GET /me - should return user's payments",
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

      // Create an order (which creates a payment record)
      await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: { registration_id: registration.id },
      });

      const response = await request(ctx.config, "payments", "me", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      assertExists(response.data.data?.payments, "Payments should exist");
      assert(
        Array.isArray(response.data.data?.payments),
        "Payments should be an array"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: GET /me - should include registration details",
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

      await request(ctx.config, "payments", "create-order", {
        method: "POST",
        accessToken: user.accessToken,
        body: { registration_id: registration.id },
      });

      const response = await request(ctx.config, "payments", "me", {
        method: "GET",
        accessToken: user.accessToken,
      });

      assertSuccess(response);
      const payments = response.data.data?.payments || [];
      
      assert(
        payments.length > 0,
        "Should have at least one payment after creating an order"
      );
      assertExists(
        payments[0].registration,
        "Registration details should be included"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: GET /me - should reject unauthenticated request",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await request(ctx.config, "payments", "me", {
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
// TEST: GET /payments/:id/receipt - Get Payment Receipt
// =============================================================================

Deno.test({
  name: "Payments: GET /:id/receipt - should return receipt for successful payment",
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

      // Verify offline payment
      const paymentResponse = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: registration.id,
            amount: sport.fees,
          },
        }
      );

      const paymentId = paymentResponse.data.data?.payment?.id;
      if (paymentId) {
        ctx.createdResources.payments.push(paymentId);
      }

      const response = await request(
        ctx.config,
        "payments",
        `${paymentId}/receipt`,
        {
          method: "GET",
          accessToken: user.accessToken,
        }
      );

      assertSuccess(response);
      // Receipt might be pending generation or have a URL
      assert(
        response.data.data?.receipt_url || response.data.data?.receipt_number,
        "Should have receipt info"
      );
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: GET /:id/receipt - should reject non-owner",
  async fn() {
    const ctx = createTestContext();

    try {
      const user1 = await setupTestUser(ctx);
      const sport = await createTestSport(ctx);
      const registration = await createTestRegistration(
        ctx,
        sport.id,
        user1.accessToken
      );

      // Verify offline payment
      const paymentResponse = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: registration.id,
            amount: sport.fees,
          },
        }
      );

      const paymentId = paymentResponse.data.data?.payment?.id;
      if (paymentId) {
        ctx.createdResources.payments.push(paymentId);
      }

      // Create another user
      const user2Data = {
        email: `test_${Date.now()}_6@example.com`,
        password: "TestPass123!",
        name: "Test User 6",
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

      // Try to get receipt as different user
      const response = await request(
        ctx.config,
        "payments",
        `${paymentId}/receipt`,
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
  name: "Payments: GET /:id/receipt - admin should access any receipt",
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

      // Verify offline payment
      const paymentResponse = await request(
        ctx.config,
        "payments",
        "verify-offline",
        {
          method: "POST",
          accessToken: ctx.adminUser!.accessToken,
          body: {
            registration_id: registration.id,
            amount: sport.fees,
          },
        }
      );

      const paymentId = paymentResponse.data.data?.payment?.id;
      if (paymentId) {
        ctx.createdResources.payments.push(paymentId);
      }

      // Admin gets receipt
      const response = await request(
        ctx.config,
        "payments",
        `${paymentId}/receipt`,
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

// =============================================================================
// Webhook Tests (Basic validation only - full tests need mock server)
// =============================================================================

Deno.test({
  name: "Payments: POST /webhook - should reject missing signature",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(
        `${ctx.config.functionsUrl}/payments/webhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ctx.config.supabaseAnonKey,
            // Missing X-Razorpay-Signature header
          },
          body: JSON.stringify({
            event: "payment.captured",
            payload: {},
          }),
        }
      );

      assertEquals(response.status, 400, "Should reject missing signature");
    } finally {
      await cleanupTestContext(ctx);
    }
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

Deno.test({
  name: "Payments: POST /webhook - should reject invalid signature",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(
        `${ctx.config.functionsUrl}/payments/webhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ctx.config.supabaseAnonKey,
            "X-Razorpay-Signature": "invalid_signature",
          },
          body: JSON.stringify({
            event: "payment.captured",
            payload: {},
          }),
        }
      );

      assertEquals(response.status, 400, "Should reject invalid signature");
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
  name: "Payments: OPTIONS - should handle CORS preflight",
  async fn() {
    const ctx = createTestContext();

    try {
      const response = await fetch(
        `${ctx.config.functionsUrl}/payments/create-order`,
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
