// Razorpay integration utilities
import { createHmac, timingSafeEqual } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } from "./utils.ts";

// Constant-time string comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  
  // If lengths differ, still do comparison to maintain constant time
  // but always return false
  if (bufA.length !== bufB.length) {
    // Compare with itself to maintain timing consistency
    timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return timingSafeEqual(bufA, bufB);
}

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

// Create authorization header for Razorpay
function getAuthHeader(): string {
  const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  return `Basic ${credentials}`;
}

// Create Razorpay order
export interface CreateOrderParams {
  amount: number; // in smallest currency unit (paise for INR)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
  // Validate amount - must be a positive integer (Razorpay requires smallest currency unit)
  if (!Number.isInteger(params.amount) || params.amount <= 0) {
    throw new Error("Amount must be a positive integer in smallest currency unit (paise)");
  }

  // Set up request timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Authorization": getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || "INR",
        receipt: params.receipt,
        notes: params.notes || {},
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.description || "Failed to create Razorpay order");
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Razorpay request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Verify Razorpay payment signature (timing-safe)
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return safeCompare(expectedSignature, signature);
}

// Verify Razorpay webhook signature (timing-safe)
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const expectedSignature = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return safeCompare(expectedSignature, signature);
}

// Fetch payment details
export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  email: string;
  contact: string;
  created_at: number;
}

export async function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  // Set up request timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${RAZORPAY_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": getAuthHeader(),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.description || "Failed to fetch payment");
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Razorpay request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Create refund
export interface CreateRefundParams {
  paymentId: string;
  amount?: number; // in paise, optional for full refund
  notes?: Record<string, string>;
}

export interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

export async function createRefund(params: CreateRefundParams): Promise<RazorpayRefund> {
  const body: Record<string, unknown> = {};
  if (params.amount) body.amount = params.amount;
  if (params.notes) body.notes = params.notes;

  // Set up request timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // Correct endpoint per Razorpay API docs: /payments/:id/refunds (plural)
    const response = await fetch(`${RAZORPAY_API_URL}/payments/${params.paymentId}/refunds`, {
      method: "POST",
      headers: {
        "Authorization": getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.description || "Failed to create refund");
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Razorpay refund request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
