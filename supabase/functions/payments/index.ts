// Payment Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  createUserClient,
  createAdminClient,
  corsResponse,
  error,
  success,
  parseBody,
  validateRequired,
  getCurrentUser,
  isAdmin,
  createAuditLog,
  RAZORPAY_KEY_ID,
} from "../_shared/utils.ts";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRefund,
} from "../_shared/razorpay.ts";
import { sendEmail, getPaymentConfirmationHtml } from "../_shared/email.ts";

interface CreateOrderRequest {
  registration_id: string;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyOfflineRequest {
  registration_id: string;
  amount: number;
  verification_note?: string;
}

interface RefundRequest {
  amount: number;
  reason: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return corsResponse();
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const action = pathParts.length > 1 ? pathParts[1] : null;
  const paymentId = pathParts.length > 2 ? pathParts[1] : null;
  const subAction = pathParts.length > 2 ? pathParts[2] : null;

  // POST /payments/create-order - Create Razorpay order
  if (req.method === "POST" && action === "create-order") {
    try {
      const user = await getCurrentUser(req);

      if (!user) {
        return error("Unauthorized", 401);
      }

      const body = await parseBody<CreateOrderRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["registration_id"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      const supabase = createUserClient(req);
      const adminClient = createAdminClient();

      // Get registration
      const { data: registration, error: regError } = await supabase
        .from("registrations")
        .select("*, sport:sports(*)")
        .eq("id", body.registration_id)
        .single();

      if (regError) {
        console.error("Registration fetch error:", regError);
        return error("Failed to fetch registration", 500);
      }

      if (!registration) {
        return error("Registration not found", 404);
      }

      if (registration.participant_id !== user.id) {
        return error("Unauthorized", 403);
      }

      if (registration.status !== "payment_pending") {
        return error(`Cannot create order for registration with status: ${registration.status}`);
      }

      // Check if there's already a pending payment
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("*")
        .eq("registration_id", body.registration_id)
        .eq("status", "pending")
        .single();

      if (existingPayment?.razorpay_order_id) {
        // Return existing order
        return success({
          order_id: existingPayment.razorpay_order_id,
          amount: existingPayment.total_amount * 100, // Convert to paise
          currency: existingPayment.currency,
          key_id: RAZORPAY_KEY_ID,
          registration,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone,
          },
        });
      }

      // Get applicable fees - use nullish coalescing to handle zero fees correctly
      const { data: fees } = await supabase.rpc("get_applicable_fees", {
        sport_id: registration.sport_id,
      });

      const amount = fees ?? registration.sport.fees;
      const amountInPaise = Math.round(amount * 100);

      // STEP 1: Create payment record first (without razorpay_order_id)
      // This prevents orphaned Razorpay orders if DB insert fails
      const { data: payment, error: insertError } = await adminClient
        .from("payments")
        .insert({
          registration_id: body.registration_id,
          user_id: user.id,
          amount: amount,
          total_amount: amount,
          currency: "INR",
          method: "online",
          status: "pending",
          razorpay_order_id: null, // Will be updated after Razorpay order creation
        })
        .select()
        .single();

      if (insertError) {
        // Check if unique constraint violation (race condition - another pending payment was created)
        if (insertError.code === "23505") {
          // Re-fetch the existing pending payment
          const { data: existingPendingPayment } = await adminClient
            .from("payments")
            .select("*")
            .eq("registration_id", body.registration_id)
            .eq("status", "pending")
            .single();
          
          if (existingPendingPayment?.razorpay_order_id) {
            return success({
              order_id: existingPendingPayment.razorpay_order_id,
              amount: existingPendingPayment.total_amount * 100,
              currency: existingPendingPayment.currency,
              key_id: RAZORPAY_KEY_ID,
              registration,
              prefill: {
                name: user.name,
                email: user.email,
                contact: user.phone,
              },
            });
          }
        }
        console.error("Payment insert error:", insertError);
        return error("Failed to create payment record", 500);
      }

      // STEP 2: Create Razorpay order
      let razorpayOrder;
      try {
        razorpayOrder = await createRazorpayOrder({
          amount: amountInPaise,
          currency: "INR",
          receipt: registration.registration_number,
          notes: {
            registration_id: body.registration_id,
            sport_name: registration.sport.name,
            user_email: user.email,
            payment_id: payment.id, // Include our payment ID for reconciliation
          },
        });
      } catch (razorpayErr) {
        // Razorpay order creation failed - mark payment as failed
        await adminClient
          .from("payments")
          .update({ status: "failed", gateway_response: { error: "Failed to create Razorpay order" } })
          .eq("id", payment.id);
        console.error("Razorpay order creation failed:", razorpayErr);
        return error("Failed to create payment order", 500);
      }

      // STEP 3: Update payment with Razorpay order ID
      const { error: updateError } = await adminClient
        .from("payments")
        .update({ razorpay_order_id: razorpayOrder.id })
        .eq("id", payment.id);

      if (updateError) {
        // DB update failed after Razorpay order created
        // We must return an error so the client doesn't get an order ID that isn't findable
        console.error("Failed to link Razorpay order to payment:", updateError);
        return error("Failed to link order to payment", 500);
      }

      return success({
        order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        key_id: RAZORPAY_KEY_ID,
        registration,
        payment_id: payment.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
      });
    } catch (err) {
      console.error("Create order error:", err);
      return error("Failed to create order", 500);
    }
  }

  // POST /payments/verify - Verify Razorpay payment
  if (req.method === "POST" && action === "verify") {
    try {
      const user = await getCurrentUser(req);

      if (!user) {
        return error("Unauthorized", 401);
      }

      const body = await parseBody<VerifyPaymentRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, [
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
      ]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      // Verify signature
      const isValidSignature = verifyPaymentSignature(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature
      );

      const adminClient = createAdminClient();

      // Get payment record
      const { data: payment } = await adminClient
        .from("payments")
        .select("*, registration:registrations(*, sport:sports(*))")
        .eq("razorpay_order_id", body.razorpay_order_id)
        .single();

      if (!payment) {
        return error("Payment not found", 404);
      }

      if (payment.user_id !== user.id) {
        return error("Unauthorized", 403);
      }

      if (!isValidSignature) {
        // Mark payment as failed only if it was pending
        if (payment.status === "pending") {
          await adminClient
            .from("payments")
            .update({
              status: "failed",
              razorpay_payment_id: body.razorpay_payment_id,
              gateway_response: { error: "Invalid signature" },
            })
            .eq("id", payment.id);

          // Log security event
          await createAuditLog(
            adminClient,
            user.id,
            "PAYMENT_SIGNATURE_FAILED",
            "payments",
            payment.id,
            null,
            { razorpay_payment_id: body.razorpay_payment_id },
            req
          );
        }

        return error("Payment verification failed", 400);
      }

      // Idempotency check: If payment is already successful, return existing data
      if (payment.status === "success") {
        console.log(`Payment ${payment.id} already verified, returning existing data`);
        return success({
          success: true,
          payment,
          message: "Payment already verified",
        });
      }

      // Update payment as successful - conditional update only for pending payments
      const { data: updatedPayment, error: updateError } = await adminClient
        .from("payments")
        .update({
          status: "success",
          razorpay_payment_id: body.razorpay_payment_id,
          razorpay_signature: body.razorpay_signature,
        })
        .eq("id", payment.id)
        .eq("status", "pending") // Only update if still pending
        .select()
        .single();

      if (updateError) {
        // Check if error is due to no matching row (already processed)
        if (!updatedPayment) {
          // Re-fetch to see if it was already verified
          const { data: recheckPayment } = await adminClient
            .from("payments")
            .select("*")
            .eq("id", payment.id)
            .single();
          
          if (recheckPayment?.status === "success") {
            return success({
              success: true,
              payment: recheckPayment,
              message: "Payment already verified",
            });
          }
        }
        return error("Failed to update payment", 500);
      }

      // Get updated registration
      const { data: registration, error: regError } = await adminClient
        .from("registrations")
        .select("*, sport:sports(*)")
        .eq("id", payment.registration_id)
        .single();

      if (regError || !registration) {
        console.error("Failed to fetch registration after payment update:", regError);
        // Still return success since payment was verified
        return success({
          success: true,
          payment: updatedPayment,
        });
      }

      // Create notification
      const { error: notifError } = await adminClient.from("notifications").insert({
        recipient_id: user.id,
        type: "payment",
        priority: "high",
        title: "Payment Successful!",
        message: `Your payment of ₹${payment.total_amount} for ${registration.sport.name} has been confirmed.`,
        related_sport_id: registration.sport_id,
        related_registration_id: registration.id,
      });
      
      if (notifError) {
        console.error("Failed to create payment notification:", notifError);
      }

      // Send confirmation email
      sendEmail({
        to: user.email,
        subject: `Payment Confirmed - ${registration.sport.name}`,
        html: getPaymentConfirmationHtml(
          user.name,
          registration.sport.name,
          registration.registration_number,
          payment.total_amount,
          updatedPayment.receipt_number || "Pending"
        ),
      }).catch(console.error);

      return success({
        success: true,
        registration,
        payment: updatedPayment,
        receipt_url: updatedPayment.receipt_url,
      });
    } catch (err) {
      console.error("Verify payment error:", err);
      return error("Failed to verify payment", 500);
    }
  }

  // POST /payments/webhook - Razorpay webhook
  if (req.method === "POST" && action === "webhook") {
    try {
      const signature = req.headers.get("X-Razorpay-Signature");

      if (!signature) {
        return error("Missing signature", 400);
      }

      const rawBody = await req.text();

      if (!verifyWebhookSignature(rawBody, signature)) {
        return error("Invalid signature", 400);
      }

      const event = JSON.parse(rawBody);
      const adminClient = createAdminClient();

      // Handle different events
      switch (event.event) {
        case "payment.captured": {
          const paymentData = event.payload.payment.entity;
          const orderId = paymentData.order_id;

          // Check if already processed
          const { data: existingPayment } = await adminClient
            .from("payments")
            .select("*")
            .eq("razorpay_order_id", orderId)
            .single();

          if (existingPayment?.status === "success") {
            // Already processed, skip
            return success({ received: true });
          }

          if (existingPayment) {
            await adminClient
              .from("payments")
              .update({
                status: "success",
                razorpay_payment_id: paymentData.id,
                gateway_response: paymentData,
              })
              .eq("id", existingPayment.id);
          }
          break;
        }

        case "payment.failed": {
          const paymentData = event.payload.payment.entity;
          const orderId = paymentData.order_id;

          // Only update if payment is still pending - don't overwrite successful payments
          await adminClient
            .from("payments")
            .update({
              status: "failed",
              razorpay_payment_id: paymentData.id,
              gateway_response: paymentData,
            })
            .eq("razorpay_order_id", orderId)
            .eq("status", "pending"); // Conditional update - only pending payments
          break;
        }

        case "refund.created":
        case "refund.processed": {
          const refundData = event.payload.refund.entity;
          const paymentId = refundData.payment_id;

          // Fetch the original payment to compare amounts and check for duplicate
          const { data: existingPaymentForRefund, error: fetchError } = await adminClient
            .from("payments")
            .select("total_amount, refund_amount, refund_id")
            .eq("razorpay_payment_id", paymentId)
            .single();

          if (fetchError || !existingPaymentForRefund) {
            console.error("Failed to fetch payment for refund:", fetchError);
            break;
          }

          // Deduplication: Skip if this refund was already processed
          if (existingPaymentForRefund.refund_id === refundData.id) {
            console.log(`Refund ${refundData.id} already processed, skipping`);
            break;
          }

          // Calculate new cumulative refund amount
          const previousRefunds = existingPaymentForRefund.refund_amount || 0;
          const newRefundAmount = refundData.amount / 100; // Convert from paise
          const cumulativeRefund = previousRefunds + newRefundAmount;
          
          // Determine status based on whether total refunded >= original payment amount
          const isFullRefund = cumulativeRefund >= existingPaymentForRefund.total_amount;
          
          await adminClient
            .from("payments")
            .update({
              status: isFullRefund ? "refunded" : "partially_refunded",
              refund_id: refundData.id,
              refund_amount: cumulativeRefund,
              gateway_response: refundData,
            })
            .eq("razorpay_payment_id", paymentId);
          break;
        }
      }

      // Log webhook event
      await adminClient.from("audit_logs").insert({
        action: `WEBHOOK_${event.event}`,
        entity_type: "payments",
        new_values: event,
      });

      return success({ received: true });
    } catch (err) {
      console.error("Webhook error:", err);
      return error("Webhook processing failed", 500);
    }
  }

  // POST /payments/verify-offline - Verify offline payment (admin)
  if (req.method === "POST" && action === "verify-offline") {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      const body = await parseBody<VerifyOfflineRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["registration_id", "amount"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      const adminClient = createAdminClient();

      // Get registration
      const { data: registration } = await adminClient
        .from("registrations")
        .select("*, participant:profiles(*), sport:sports(*)")
        .eq("id", body.registration_id)
        .single();

      if (!registration) {
        return error("Registration not found", 404);
      }

      if (registration.status === "confirmed") {
        return error("Registration already confirmed");
      }

      if (registration.status === "cancelled") {
        return error("Cannot verify payment for cancelled registration");
      }

      // Check for existing successful payment
      const { data: existingPayment } = await adminClient
        .from("payments")
        .select("id")
        .eq("registration_id", body.registration_id)
        .eq("status", "success")
        .single();

      if (existingPayment) {
        return error("A successful payment already exists for this registration");
      }

      // Validate user before proceeding
      if (!user) {
        return error("Unable to identify user", 401);
      }

      // Create payment record
      const { data: payment, error: insertError } = await adminClient
        .from("payments")
        .insert({
          registration_id: body.registration_id,
          user_id: registration.participant_id,
          amount: body.amount,
          total_amount: body.amount,
          currency: "INR",
          method: "offline",
          status: "success",
          offline_verified_by: user?.id,
          offline_verification_note: body.verification_note,
          offline_verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return error("Failed to create payment", 500);
      }

      // Create notification
      await adminClient.from("notifications").insert({
        recipient_id: registration.participant_id,
        type: "payment",
        title: "Payment Verified",
        message: `Your offline payment for ${registration.sport.name} has been verified.`,
        related_sport_id: registration.sport_id,
        related_registration_id: body.registration_id,
      });

      // Create audit log
      await createAuditLog(
        adminClient,
        user.id,
        "VERIFY_OFFLINE_PAYMENT",
        "payments",
        payment.id,
        null,
        { amount: body.amount, registration_id: body.registration_id },
        req
      );

      // Get updated registration
      const { data: updatedReg } = await adminClient
        .from("registrations")
        .select("*")
        .eq("id", body.registration_id)
        .single();

      return success({ payment, registration: updatedReg }, "Payment verified successfully");
    } catch (err) {
      console.error("Verify offline payment error:", err);
      return error("Failed to verify payment", 500);
    }
  }

  // POST /payments/:id/refund - Process refund (admin)
  if (req.method === "POST" && paymentId && subAction === "refund") {
    try {
      if (!(await isAdmin(req))) {
        return error("Unauthorized", 403);
      }

      const user = await getCurrentUser(req);
      if (!user) {
        return error("Unable to identify user", 401);
      }

      const body = await parseBody<RefundRequest>(req);
      if (!body) {
        return error("Invalid request body");
      }

      const { valid, missing } = validateRequired(body, ["amount", "reason"]);
      if (!valid) {
        return error(`Missing required fields: ${missing.join(", ")}`);
      }

      const adminClient = createAdminClient();

      // Get payment
      const { data: payment } = await adminClient
        .from("payments")
        .select("*, registration:registrations(*, participant:profiles(*), sport:sports(*))")
        .eq("id", paymentId)
        .single();

      if (!payment) {
        return error("Payment not found", 404);
      }

      if (payment.status === "refunded") {
        return error("Payment has already been fully refunded");
      }

      if (payment.status !== "success" && payment.status !== "partially_refunded") {
        return error("Can only refund successful or partially refunded payments");
      }

      // Calculate remaining refundable amount
      const previousRefunds = payment.refund_amount || 0;
      const remainingRefundable = payment.total_amount - previousRefunds;

      if (body.amount > remainingRefundable) {
        return error(`Refund amount cannot exceed remaining refundable amount (₹${remainingRefundable})`);
      }

      let refundResult = null;

      // Process refund via Razorpay if online payment
      if (payment.method === "online" && payment.razorpay_payment_id) {
        try {
          refundResult = await createRefund({
            paymentId: payment.razorpay_payment_id,
            amount: Math.round(body.amount * 100), // Convert to paise
            notes: {
              reason: body.reason,
              processed_by: user.email,
            },
          });
        } catch (refundErr) {
          console.error("Razorpay refund error:", refundErr);
          return error("Failed to process refund with payment gateway");
        }
      }

      // Update payment record with cumulative refund amount
      const cumulativeRefund = previousRefunds + body.amount;
      const isFullRefund = cumulativeRefund >= payment.total_amount;
      const { data: updatedPayment, error: updateError } = await adminClient
        .from("payments")
        .update({
          status: isFullRefund ? "refunded" : "partially_refunded",
          refund_amount: cumulativeRefund,
          refund_reason: body.reason,
          refund_id: refundResult?.id,
          refund_processed_by: user.id,
          refund_processed_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (updateError) {
        return error("Failed to update payment", 500);
      }

      // Create notification
      await adminClient.from("notifications").insert({
        recipient_id: payment.registration.participant_id,
        type: "payment",
        title: "Refund Processed",
        message: `A refund of ₹${body.amount} has been processed for ${payment.registration.sport.name}.`,
        related_sport_id: payment.registration.sport_id,
        related_registration_id: payment.registration_id,
      });
      
      // Create audit log
      await createAuditLog(
        adminClient,
        user.id,
        "PROCESS_REFUND",
        "payments",
        paymentId,
        { status: payment.status },
        { status: updatedPayment.status, refund_amount: body.amount, reason: body.reason },
        req
      );

      return success(updatedPayment, "Refund processed successfully");
    } catch (err) {
      console.error("Process refund error:", err);
      return error("Failed to process refund", 500);
    }
  }

  // GET /payments/me - Get user's payments
  if (req.method === "GET" && action === "me") {
    const user = await getCurrentUser(req);

    if (!user) {
      return error("Unauthorized", 401);
    }

    const supabase = createUserClient(req);

    const { data: payments, error: fetchError } = await supabase
      .from("payments")
      .select("*, registration:registrations(*, sport:sports(name, slug))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return error("Failed to fetch payments", 500);
    }

    return success({ payments });
  }

  // GET /payments/:id/receipt - Get payment receipt
  if (req.method === "GET" && paymentId && subAction === "receipt") {
    try {
      const user = await getCurrentUser(req);

      if (!user) {
        return error("Unauthorized", 401);
      }

      const supabase = createUserClient(req);

      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .single();

      if (!payment) {
        return error("Payment not found", 404);
      }

      if (payment.user_id !== user.id && user.role !== "admin") {
        return error("Unauthorized", 403);
      }

      if (payment.receipt_url) {
        return success({ receipt_url: payment.receipt_url });
      }

      // TODO: Generate PDF receipt and upload to storage
      // For now, return a message
      return success({
        message: "Receipt generation pending",
        receipt_number: payment.receipt_number,
      });
    } catch (err) {
      console.error("Get receipt error:", err);
      return error("Failed to get receipt", 500);
    }
  }

  return error("Not found", 404);
});
