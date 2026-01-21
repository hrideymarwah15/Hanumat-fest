"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Trophy,
  Calendar,
  Users,
  MapPin,
  Clock,
  CreditCard,
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Plus,
} from "lucide-react";

// Mock registrations data
const registrations = [
  {
    id: "REG-2026-CRI-001",
    sport: {
      name: "Cricket",
      icon: "🏏",
      category: "outdoor",
    },
    team: {
      name: "Thunder Bolts",
      members: 12,
      maxMembers: 15,
    },
    status: "confirmed",
    paymentStatus: "paid",
    amount: 400,
    eventDate: "March 15, 2026",
    eventTime: "09:00 AM",
    venue: "Main Cricket Ground",
    registeredAt: "Feb 10, 2026",
    receiptUrl: "#",
  },
  {
    id: "REG-2026-FOO-002",
    sport: {
      name: "Football",
      icon: "⚽",
      category: "outdoor",
    },
    team: {
      name: "Goal Getters",
      members: 5,
      maxMembers: 7,
    },
    status: "pending",
    paymentStatus: "pending",
    amount: 300,
    eventDate: "March 15, 2026",
    eventTime: "02:00 PM",
    venue: "Football Field A",
    registeredAt: "Feb 15, 2026",
    receiptUrl: null,
  },
  {
    id: "REG-2026-VAL-003",
    sport: {
      name: "Valorant",
      icon: "🎮",
      category: "esports",
    },
    team: {
      name: "Phantom Squad",
      members: 5,
      maxMembers: 6,
    },
    status: "confirmed",
    paymentStatus: "paid",
    amount: 350,
    eventDate: "March 17, 2026",
    eventTime: "10:00 AM",
    venue: "E-Sports Arena",
    registeredAt: "Feb 12, 2026",
    receiptUrl: "#",
  },
  {
    id: "REG-2026-CHE-004",
    sport: {
      name: "Chess",
      icon: "♟️",
      category: "indoor",
    },
    team: {
      name: null,
      members: 1,
      maxMembers: 1,
    },
    status: "cancelled",
    paymentStatus: "refunded",
    amount: 50,
    eventDate: "March 15, 2026",
    eventTime: "11:00 AM",
    venue: "Indoor Hall B",
    registeredAt: "Feb 05, 2026",
    receiptUrl: null,
  },
];

type RegistrationStatus = "all" | "confirmed" | "pending" | "cancelled";

export default function RegistrationsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RegistrationStatus>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<
    (typeof registrations)[0] | null
  >(null);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.sport.name.toLowerCase().includes(search.toLowerCase()) ||
      reg.team.name?.toLowerCase().includes(search.toLowerCase()) ||
      reg.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || reg.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Registrations</h1>
          <p className="text-muted-foreground">
            Manage all your sports registrations
          </p>
        </div>
        <Link href="/sports">
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Registration
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by sport, team, or ID..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          {(["all", "confirmed", "pending", "cancelled"] as const).map(
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

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
          <p className="text-muted-foreground mb-4">
            {search || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Start by registering for a sport"}
          </p>
          <Link href="/sports">
            <Button variant="gradient">Browse Sports</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-card rounded-xl border p-4 sm:p-6 card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Sport Icon */}
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl shrink-0">
                  {reg.sport.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{reg.sport.name}</h3>
                    {getStatusBadge(reg.status)}
                    {getPaymentBadge(reg.paymentStatus)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {reg.team.name || "Individual"} •{" "}
                    <span className="font-mono">{reg.id}</span>
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {reg.eventDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {reg.eventTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {reg.venue}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <div className="text-lg font-bold text-primary">
                    ₹{reg.amount}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRegistration(reg)}
                    >
                      <Eye className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    {reg.paymentStatus === "pending" && (
                      <Link href="/dashboard/payments">
                        <Button size="sm" variant="gradient">
                          <CreditCard className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Pay</span>
                        </Button>
                      </Link>
                    )}
                    {reg.receiptUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Receipt</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Details Dialog */}
      <Dialog
        open={!!selectedRegistration}
        onOpenChange={() => setSelectedRegistration(null)}
      >
        {selectedRegistration && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{selectedRegistration.sport.icon}</span>
                {selectedRegistration.sport.name} Registration
              </DialogTitle>
              <DialogDescription>
                Registration ID: {selectedRegistration.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Status</span>
                <div className="flex gap-2">
                  {getStatusBadge(selectedRegistration.status)}
                  {getPaymentBadge(selectedRegistration.paymentStatus)}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Name</span>
                  <span className="font-medium">
                    {selectedRegistration.team.name || "Individual"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="font-medium">
                    {selectedRegistration.team.members}/
                    {selectedRegistration.team.maxMembers} members
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event Date</span>
                  <span className="font-medium">
                    {selectedRegistration.eventDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event Time</span>
                  <span className="font-medium">
                    {selectedRegistration.eventTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="font-medium">
                    {selectedRegistration.venue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered On</span>
                  <span className="font-medium">
                    {selectedRegistration.registeredAt}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg text-primary">
                    ₹{selectedRegistration.amount}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {selectedRegistration.status === "pending" && (
                  <Link href="/dashboard/teams" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Team
                    </Button>
                  </Link>
                )}
                {selectedRegistration.paymentStatus === "pending" && (
                  <Link href="/dashboard/payments" className="flex-1">
                    <Button variant="gradient" className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                    </Button>
                  </Link>
                )}
                {selectedRegistration.receiptUrl && (
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
