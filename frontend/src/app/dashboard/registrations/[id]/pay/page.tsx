"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  CreditCard,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Receipt,
  Clock,
  Tag,
  Download,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Mock registration data for payment
const mockPaymentData = {
  registration: {
    id: "reg-001",
    registrationNumber: "REG-CRI-0001",
    status: "payment_pending",
  },
  sport: {
    name: "Cricket Tournament",
    slug: "cricket-championship",
    category: "outdoor",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop",
  },
  pricing: {
    baseFee: 1500,
    earlyBirdFee: 1200,
    isEarlyBird: true,
    discount: 300,
    total: 1200,
  },
  prefill: {
    name: "John Doe",
    email: "john.doe@example.com",
    contact: "9876543210",
  },
};

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<typeof mockPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPaymentData(mockPaymentData);
      setIsLoading(false);
    };
    loadPaymentData();
  }, [resolvedParams.id]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate Razorpay integration
      // In real implementation:
      // 1. Call API to create Razorpay order
      // 2. Open Razorpay checkout
      // 3. Handle payment response
      // 4. Verify payment on backend

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate successful payment
      setReceiptNumber("RCP-24-000001");
      setPaymentStatus("success");
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Registration Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The registration you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/dashboard/registrations">
          <Button>Back to Registrations</Button>
        </Link>
      </div>
    );
  }

  // Success State
  if (paymentStatus === "success") {
    return (
      <div className="max-w-lg mx-auto py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your registration is now confirmed</p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p className="text-2xl font-mono font-bold">
                {paymentData.registration.registrationNumber}
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sport</span>
                <span className="font-medium">{paymentData.sport.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receipt Number</span>
                <span className="font-mono">{receiptNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-green-600">
                  ₹{paymentData.pricing.total}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A confirmation email has been sent to{" "}
                <span className="font-medium">{paymentData.prefill.email}</span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              <Link href={`/dashboard/registrations/${paymentData.registration.id}`}>
                <Button className="w-full">View Registration Details</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Failed State
  if (paymentStatus === "failed") {
    return (
      <div className="max-w-lg mx-auto py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-red-100">Something went wrong with your payment</p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Don&apos;t worry! If any amount was deducted, it will be refunded within 5-7 
                business days. You can try again or contact support if the issue persists.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setPaymentStatus("pending")} className="w-full">
                Try Again
              </Button>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/registrations/${paymentData.registration.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registration
        </Link>
        <h1 className="text-2xl font-bold font-heading">Complete Payment</h1>
        <p className="text-muted-foreground">
          Secure payment powered by Razorpay
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sport Info */}
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img
                    src={paymentData.sport.image}
                    alt={paymentData.sport.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{paymentData.sport.name}</h3>
                  <Badge variant={paymentData.sport.category as "outdoor" | "indoor"}>
                    {paymentData.sport.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Registration: {paymentData.registration.registrationNumber}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registration Fee</span>
                  <span>₹{paymentData.pricing.baseFee}</span>
                </div>
                {paymentData.pricing.isEarlyBird && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Early Bird Discount
                    </span>
                    <span>-₹{paymentData.pricing.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{paymentData.pricing.total}</span>
                </div>
              </div>

              {/* Early Bird Badge */}
              {paymentData.pricing.isEarlyBird && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Early Bird Pricing Applied!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      You&apos;re saving ₹{paymentData.pricing.discount} with early registration
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Button Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-primary">₹{paymentData.pricing.total}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay ₹{paymentData.pricing.total}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Your payment is secured and encrypted
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Receipt className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Receipt will be sent to your email
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IndianRupee className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    UPI, Cards, Net Banking supported
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Razorpay Badge */}
          <div className="flex items-center justify-center gap-2 opacity-60">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <div className="font-bold text-blue-600">Razorpay</div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Important Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Please do not close this window or press back during payment</li>
                <li>• If payment fails, the amount will be refunded within 5-7 business days</li>
                <li>• For any issues, contact support with your registration number</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
