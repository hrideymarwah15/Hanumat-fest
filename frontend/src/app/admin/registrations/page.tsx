"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Hourglass,
  Users,
  Calendar,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock registrations data
const mockRegistrations = [
  {
    id: "reg-001",
    regNumber: "REG-CRI-0001",
    participant: { name: "John Doe", email: "john@example.com", phone: "9876543210" },
    sport: { id: "1", name: "Cricket" },
    college: "IIT Delhi",
    status: "confirmed",
    paymentStatus: "completed",
    amount: 1200,
    createdAt: new Date("2024-01-10"),
    isTeam: true,
    teamName: "Team Alpha",
    teamSize: 11,
  },
  {
    id: "reg-002",
    regNumber: "REG-FOO-0002",
    participant: { name: "Jane Smith", email: "jane@example.com", phone: "9876543211" },
    sport: { id: "2", name: "Football" },
    college: "IIT Bombay",
    status: "payment_pending",
    paymentStatus: "pending",
    amount: 800,
    createdAt: new Date("2024-01-11"),
    isTeam: true,
    teamName: "FC Phoenix",
    teamSize: 11,
  },
  {
    id: "reg-003",
    regNumber: "REG-BAD-0003",
    participant: { name: "Mike Johnson", email: "mike@example.com", phone: "9876543212" },
    sport: { id: "3", name: "Badminton" },
    college: "BITS Pilani",
    status: "confirmed",
    paymentStatus: "completed",
    amount: 300,
    createdAt: new Date("2024-01-12"),
    isTeam: false,
    teamName: null,
    teamSize: 1,
  },
  {
    id: "reg-004",
    regNumber: "REG-VOL-0004",
    participant: { name: "Sarah Williams", email: "sarah@example.com", phone: "9876543213" },
    sport: { id: "4", name: "Volleyball" },
    college: "NIT Trichy",
    status: "waitlist",
    paymentStatus: "pending",
    amount: 600,
    createdAt: new Date("2024-01-13"),
    isTeam: true,
    teamName: "Spike Masters",
    teamSize: 6,
  },
  {
    id: "reg-005",
    regNumber: "REG-CHE-0005",
    participant: { name: "David Brown", email: "david@example.com", phone: "9876543214" },
    sport: { id: "5", name: "Chess" },
    college: "IIT Madras",
    status: "confirmed",
    paymentStatus: "completed",
    amount: 150,
    createdAt: new Date("2024-01-14"),
    isTeam: false,
    teamName: null,
    teamSize: 1,
  },
  {
    id: "reg-006",
    regNumber: "REG-TT-0006",
    participant: { name: "Emily Davis", email: "emily@example.com", phone: "9876543215" },
    sport: { id: "6", name: "Table Tennis" },
    college: "IIT Kanpur",
    status: "cancelled",
    paymentStatus: "refunded",
    amount: 200,
    createdAt: new Date("2024-01-15"),
    isTeam: false,
    teamName: null,
    teamSize: 1,
  },
];

const sports = [
  { id: "all", name: "All Sports" },
  { id: "1", name: "Cricket" },
  { id: "2", name: "Football" },
  { id: "3", name: "Badminton" },
  { id: "4", name: "Volleyball" },
  { id: "5", name: "Chess" },
  { id: "6", name: "Table Tennis" },
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "waitlist", label: "Waitlist" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentStatuses = [
  { value: "all", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "payment_pending":
      return <CreditCard className="h-4 w-4 text-yellow-600" />;
    case "pending":
      return <Clock className="h-4 w-4 text-gray-600" />;
    case "waitlist":
      return <Hourglass className="h-4 w-4 text-blue-600" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function AdminRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<typeof mockRegistrations[0] | null>(null);

  const filteredRegistrations = mockRegistrations.filter((reg) => {
    const matchesSearch =
      reg.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.college.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = sportFilter === "all" || reg.sport.id === sportFilter;
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || reg.paymentStatus === paymentFilter;
    return matchesSearch && matchesSport && matchesStatus && matchesPayment;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRegistrations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRegistrations.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const stats = {
    total: mockRegistrations.length,
    confirmed: mockRegistrations.filter((r) => r.status === "confirmed").length,
    pending: mockRegistrations.filter((r) => r.status === "payment_pending" || r.status === "pending").length,
    waitlist: mockRegistrations.filter((r) => r.status === "waitlist").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Registrations</h1>
          <p className="text-muted-foreground">
            Manage all sport registrations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Hourglass className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.waitlist}</p>
                <p className="text-xs text-muted-foreground">Waitlist</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.length} registration(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Confirm Selected
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  Cancel Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registrations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b bg-muted/30">
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="p-4 font-medium">Reg #</th>
                  <th className="p-4 font-medium">Participant</th>
                  <th className="p-4 font-medium">Sport</th>
                  <th className="p-4 font-medium">College</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(reg.id)}
                        onChange={() => toggleSelect(reg.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm">{reg.regNumber}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{reg.participant.name}</p>
                        <p className="text-xs text-muted-foreground">{reg.participant.email}</p>
                        {reg.isTeam && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {reg.teamName} ({reg.teamSize})
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{reg.sport.name}</td>
                    <td className="p-4">{reg.college}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(reg.status)}
                        <Badge
                          variant={
                            reg.status === "confirmed"
                              ? "confirmed"
                              : reg.status === "payment_pending"
                              ? "payment_pending"
                              : reg.status === "waitlist"
                              ? "waitlist"
                              : reg.status === "cancelled"
                              ? "cancelled"
                              : "pending"
                          }
                        >
                          {reg.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <Badge
                          variant={
                            reg.paymentStatus === "completed"
                              ? "success"
                              : reg.paymentStatus === "refunded"
                              ? "secondary"
                              : "warning"
                          }
                        >
                          {reg.paymentStatus}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">₹{reg.amount}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {reg.createdAt.toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/registrations/${reg.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {reg.status === "payment_pending" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setShowVerifyDialog(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Verify Payment
                            </DropdownMenuItem>
                          )}
                          {reg.status === "waitlist" && (
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm from Waitlist
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {reg.status !== "cancelled" && (
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Registration
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredRegistrations.length === 0 && (
            <div className="py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRegistrations.length} of {mockRegistrations.length} registrations
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Verify Payment Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Offline Payment</DialogTitle>
            <DialogDescription>
              Verify offline payment for registration {selectedRegistration?.regNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Participant</span>
                <span className="font-medium">{selectedRegistration?.participant.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sport</span>
                <span>{selectedRegistration?.sport.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected Amount</span>
                <span className="font-medium">₹{selectedRegistration?.amount}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Received</label>
              <Input type="number" placeholder="Enter amount" defaultValue={selectedRegistration?.amount} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Note</label>
              <Input placeholder="e.g., Cash received at counter" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowVerifyDialog(false)}>
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
