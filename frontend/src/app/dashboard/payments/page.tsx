"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  CreditCard,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
  IndianRupee,
} from "lucide-react";

// Mock payments data
const payments = [
  {
    id: "PAY-2026-001",
    registrationId: "REG-2026-CRI-001",
    sport: {
      name: "Cricket",
      icon: "🏏",
    },
    teamName: "Thunder Bolts",
    amount: 400,
    status: "completed",
    method: "UPI",
    transactionId: "TXN123456789",
    paidAt: "Feb 10, 2026, 10:30 AM",
    receiptUrl: "#",
  },
  {
    id: "PAY-2026-002",
    registrationId: "REG-2026-FOO-002",
    sport: {
      name: "Football",
      icon: "⚽",
    },
    teamName: "Goal Getters",
    amount: 300,
    status: "pending",
    method: null,
    transactionId: null,
    paidAt: null,
    receiptUrl: null,
  },
  {
    id: "PAY-2026-003",
    registrationId: "REG-2026-VAL-003",
    sport: {
      name: "Valorant",
      icon: "🎮",
    },
    teamName: "Phantom Squad",
    amount: 350,
    status: "completed",
    method: "Card",
    transactionId: "TXN987654321",
    paidAt: "Feb 12, 2026, 02:15 PM",
    receiptUrl: "#",
  },
  {
    id: "PAY-2026-004",
    registrationId: "REG-2026-CHE-004",
    sport: {
      name: "Chess",
      icon: "♟️",
    },
    teamName: null,
    amount: 50,
    status: "refunded",
    method: "UPI",
    transactionId: "TXN456789123",
    paidAt: "Feb 05, 2026, 11:45 AM",
    receiptUrl: null,
  },
];

type PaymentStatus = "all" | "completed" | "pending" | "refunded";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PaymentStatus>("all");
  const [selectedPayment, setSelectedPayment] = useState<
    (typeof payments)[0] | null
  >(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payingFor, setPayingFor] = useState<(typeof payments)[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.sport.name.toLowerCase().includes(search.toLowerCase()) ||
      payment.teamName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || payment.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowPayDialog(false);
    setPayingFor(null);
    // TODO: Integrate with Razorpay
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          View and manage your payment history
        </p>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-400">
                  You have {pendingPayments.length} pending payment
                  {pendingPayments.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Total amount due: ₹{totalPending}
                </p>
              </div>
            </div>
            <Button
              variant="gradient"
              onClick={() => {
                setPayingFor(pendingPayments[0]);
                setShowPayDialog(true);
              }}
            >
              Pay Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "completed", "pending", "refunded"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === status
                    ? "bg-primary text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No payments found</h3>
          <p className="text-muted-foreground">
            {search || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Your payment history will appear here"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">
                    Sport / Team
                  </th>
                  <th className="text-left p-4 font-medium text-sm hidden sm:table-cell">
                    Payment ID
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Amount</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                  <th className="text-left p-4 font-medium text-sm hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-right p-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{payment.sport.icon}</span>
                        <div>
                          <p className="font-medium">{payment.sport.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.teamName || "Individual"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="font-mono text-sm">{payment.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold">₹{payment.amount}</span>
                    </td>
                    <td className="p-4">{getStatusBadge(payment.status)}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                      {payment.paidAt || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === "pending" && (
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => {
                              setPayingFor(payment);
                              setShowPayDialog(true);
                            }}
                          >
                            Pay
                          </Button>
                        )}
                        {payment.receiptUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Details Dialog */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={() => setSelectedPayment(null)}
      >
        {selectedPayment && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Payment ID: {selectedPayment.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <span className="text-4xl">{selectedPayment.sport.icon}</span>
                <div>
                  <p className="font-semibold text-lg">
                    {selectedPayment.sport.name}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedPayment.teamName || "Individual Registration"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">
                    ₹{selectedPayment.amount}
                  </span>
                </div>
                {selectedPayment.method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span>{selectedPayment.method}</span>
                  </div>
                )}
                {selectedPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-sm">
                      {selectedPayment.transactionId}
                    </span>
                  </div>
                )}
                {selectedPayment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid On</span>
                    <span>{selectedPayment.paidAt}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration ID</span>
                  <span className="font-mono text-sm">
                    {selectedPayment.registrationId}
                  </span>
                </div>
              </div>

              {selectedPayment.receiptUrl && (
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              )}

              {selectedPayment.status === "pending" && (
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => {
                    setSelectedPayment(null);
                    setPayingFor(selectedPayment);
                    setShowPayDialog(true);
                  }}
                >
                  Complete Payment
                </Button>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        {payingFor && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Pay for {payingFor.sport.name} registration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sport</span>
                  <span className="font-medium">{payingFor.sport.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team</span>
                  <span className="font-medium">
                    {payingFor.teamName || "Individual"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold text-xl text-primary">
                    ₹{payingFor.amount}
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                You will be redirected to Razorpay for secure payment
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPayDialog(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee className="h-4 w-4 mr-1" />
                    Pay ₹{payingFor.amount}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
