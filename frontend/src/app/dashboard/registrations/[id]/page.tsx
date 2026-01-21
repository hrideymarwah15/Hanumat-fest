"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  User,
  Users,
  Crown,
  CreditCard,
  Download,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Building2,
  Receipt,
  Shield,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock registration data
const mockRegistration = {
  id: "reg-001",
  registrationNumber: "REG-CRI-0001",
  status: "payment_pending" as "pending" | "payment_pending" | "confirmed" | "waitlist" | "cancelled" | "withdrawn",
  createdAt: new Date("2024-01-10"),
  sport: {
    id: "cricket-1",
    name: "Cricket Tournament",
    slug: "cricket-championship",
    category: "outdoor",
    eventDate: new Date("2024-03-20"),
    venue: "Main Cricket Ground",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop",
  },
  participant: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "9876543210",
    college: "IIT Delhi",
  },
  isTeamEvent: true,
  team: {
    name: "Team Alpha",
    members: [
      { id: "1", name: "John Doe", email: "john.doe@example.com", phone: "9876543210", isCaptain: true },
      { id: "2", name: "Jane Smith", email: "jane.smith@example.com", phone: "9876543211", isCaptain: false },
      { id: "3", name: "Mike Johnson", email: "mike.j@example.com", phone: "9876543212", isCaptain: false },
      { id: "4", name: "Sarah Williams", email: "sarah.w@example.com", phone: "9876543213", isCaptain: false },
      { id: "5", name: "David Brown", email: "david.b@example.com", phone: "9876543214", isCaptain: false },
      { id: "6", name: "Emily Davis", email: "emily.d@example.com", phone: "9876543215", isCaptain: false },
      { id: "7", name: "Chris Wilson", email: "chris.w@example.com", phone: "9876543216", isCaptain: false },
      { id: "8", name: "Amanda Taylor", email: "amanda.t@example.com", phone: "9876543217", isCaptain: false },
      { id: "9", name: "Ryan Martinez", email: "ryan.m@example.com", phone: "9876543218", isCaptain: false },
      { id: "10", name: "Lisa Anderson", email: "lisa.a@example.com", phone: "9876543219", isCaptain: false },
      { id: "11", name: "Kevin Thomas", email: "kevin.t@example.com", phone: "9876543220", isCaptain: false },
    ],
  },
  payment: {
    id: "pay-001",
    receiptNumber: "RCP-24-000001",
    amount: 1200,
    status: "completed" as const,
    method: "razorpay",
    paidAt: new Date("2024-01-10"),
  },
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "confirmed":
      return {
        color: "success" as const,
        icon: CheckCircle,
        label: "Confirmed",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
      };
    case "payment_pending":
      return {
        color: "warning" as const,
        icon: CreditCard,
        label: "Payment Pending",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
      };
    case "pending":
      return {
        color: "pending" as const,
        icon: Clock,
        label: "Pending",
        bgColor: "bg-gray-50 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
      };
    case "waitlist":
      return {
        color: "info" as const,
        icon: Clock,
        label: "Waitlisted",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
      };
    case "cancelled":
      return {
        color: "destructive" as const,
        icon: XCircle,
        label: "Cancelled",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
      };
    default:
      return {
        color: "secondary" as const,
        icon: AlertCircle,
        label: status,
        bgColor: "bg-gray-50 dark:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
      };
  }
};

export default function RegistrationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [registration, setRegistration] = useState<typeof mockRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);

  useEffect(() => {
    const loadRegistration = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRegistration(mockRegistration);
      setIsLoading(false);
    };
    loadRegistration();
  }, [resolvedParams.id]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/dashboard/registrations");
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleDownloadReceipt = () => {
    // Simulate receipt download
    alert("Receipt download started!");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  if (!registration) {
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

  const statusConfig = getStatusConfig(registration.status);
  const StatusIcon = statusConfig.icon;
  const canEdit = ["pending", "payment_pending"].includes(registration.status);
  const canCancel = ["pending", "payment_pending", "confirmed", "waitlist"].includes(
    registration.status
  );
  const canPay = registration.status === "payment_pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/registrations"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registrations
          </Link>
          <h1 className="text-2xl font-bold font-heading">Registration Details</h1>
          <p className="text-muted-foreground">{registration.registrationNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Check-in QR Code</DialogTitle>
                <DialogDescription>
                  Show this QR code at the event for quick check-in
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center p-8">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-muted-foreground" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-lg font-bold">{registration.registrationNumber}</p>
                <p className="text-sm text-muted-foreground">{registration.sport.name}</p>
              </div>
            </DialogContent>
          </Dialog>
          {registration.payment?.receiptNumber && (
            <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-6 w-6 ${
              registration.status === "confirmed" ? "text-green-600" :
              registration.status === "payment_pending" ? "text-yellow-600" :
              registration.status === "cancelled" ? "text-red-600" :
              "text-muted-foreground"
            }`} />
            <div>
              <p className="font-semibold">{statusConfig.label}</p>
              <p className="text-sm text-muted-foreground">
                {registration.status === "confirmed"
                  ? "Your registration is confirmed. See you at the event!"
                  : registration.status === "payment_pending"
                  ? "Complete your payment to confirm registration"
                  : ""}
              </p>
            </div>
          </div>
          {canPay && (
            <Link href={`/dashboard/registrations/${registration.id}/pay`}>
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sport Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Sport Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 h-32 rounded-lg bg-muted overflow-hidden">
                  <img
                    src={registration.sport.image}
                    alt={registration.sport.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{registration.sport.name}</h3>
                    <Badge variant={registration.sport.category as "outdoor" | "indoor"}>
                      {registration.sport.category}
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{registration.sport.eventDate.toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{registration.sport.venue}</span>
                    </div>
                  </div>
                  <Link href={`/sports/${registration.sport.slug}`}>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View Sport Details →
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Participant Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{registration.participant.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{registration.participant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{registration.participant.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">College</p>
                    <p className="font-medium">{registration.participant.college}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Details */}
          {registration.isTeamEvent && registration.team && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Details
                </CardTitle>
                {canEdit && (
                  <Link href={`/dashboard/registrations/${registration.id}/edit-team`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Team
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Name</p>
                      <p className="font-semibold text-lg">{registration.team.name}</p>
                    </div>
                    <Badge variant="secondary">
                      {registration.team.members.length} Members
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                    <div className="grid gap-2">
                      {registration.team.members.map((member, index) => (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            member.isCaptain
                              ? "bg-primary/5 border border-primary/20"
                              : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {member.name}
                                {member.isCaptain && (
                                  <Badge variant="default" className="text-xs gap-1">
                                    <Crown className="h-3 w-3" />
                                    Captain
                                  </Badge>
                                )}
                              </p>
                              {member.email && (
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              )}
                            </div>
                          </div>
                          {member.phone && (
                            <span className="text-sm text-muted-foreground">{member.phone}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registration Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registration #</span>
                <span className="font-mono font-medium">{registration.registrationNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registered On</span>
                <span>{registration.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {registration.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Payment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receipt #</span>
                  <span className="font-mono">{registration.payment.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    ₹{registration.payment.amount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span>{registration.payment.paidAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <Badge variant="secondary">
                    {registration.payment.method === "razorpay" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleDownloadReceipt}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canPay && (
                <Link href={`/dashboard/registrations/${registration.id}/pay`} className="block">
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payment
                  </Button>
                </Link>
              )}
              {canEdit && registration.isTeamEvent && (
                <Link
                  href={`/dashboard/registrations/${registration.id}/edit-team`}
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Team
                  </Button>
                </Link>
              )}
              {canCancel && (
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Registration
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Registration?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your registration for {registration.sport.name}?
                        {registration.payment?.status === "completed" && (
                          <span className="block mt-2 text-yellow-600">
                            Note: Refund will be processed according to our refund policy.
                          </span>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        Keep Registration
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Yes, Cancel"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Need Help?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support if you have any questions about your registration.
                  </p>
                  <Link href="/contact" className="text-xs text-primary hover:underline mt-2 inline-block">
                    Contact Support →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
