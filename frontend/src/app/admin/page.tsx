"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  Clock,
  Hourglass,
  IndianRupee,
  Trophy,
  Building2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock dashboard data
const stats = [
  {
    label: "Total Registrations",
    value: 150,
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    label: "Confirmed",
    value: 120,
    change: "+8%",
    trend: "up",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    label: "Pending Payment",
    value: 20,
    change: "-5%",
    trend: "down",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    label: "Waitlist",
    value: 10,
    change: "+2",
    trend: "up",
    icon: Hourglass,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
];

const financialStats = [
  {
    label: "Total Revenue",
    value: "₹1,50,000",
    subtext: "All time",
    icon: IndianRupee,
    color: "text-green-600",
  },
  {
    label: "Today's Revenue",
    value: "₹12,500",
    subtext: "8 payments",
    icon: CreditCard,
    color: "text-blue-600",
  },
  {
    label: "Active Sports",
    value: "10",
    subtext: "6 open for registration",
    icon: Trophy,
    color: "text-orange-600",
  },
  {
    label: "Colleges",
    value: "25",
    subtext: "Participating",
    icon: Building2,
    color: "text-purple-600",
  },
];

const recentRegistrations = [
  {
    id: "reg-001",
    regNumber: "REG-CRI-0001",
    participant: "John Doe",
    sport: "Cricket",
    college: "IIT Delhi",
    status: "confirmed",
    amount: 1200,
    time: "2 hours ago",
  },
  {
    id: "reg-002",
    regNumber: "REG-FOO-0002",
    participant: "Jane Smith",
    sport: "Football",
    college: "IIT Bombay",
    status: "payment_pending",
    amount: 800,
    time: "3 hours ago",
  },
  {
    id: "reg-003",
    regNumber: "REG-BAD-0003",
    participant: "Mike Johnson",
    sport: "Badminton",
    college: "BITS Pilani",
    status: "confirmed",
    amount: 300,
    time: "5 hours ago",
  },
  {
    id: "reg-004",
    regNumber: "REG-VOL-0004",
    participant: "Sarah Williams",
    sport: "Volleyball",
    college: "NIT Trichy",
    status: "waitlist",
    amount: 600,
    time: "6 hours ago",
  },
  {
    id: "reg-005",
    regNumber: "REG-CHE-0005",
    participant: "David Brown",
    sport: "Chess",
    college: "IIT Madras",
    status: "confirmed",
    amount: 150,
    time: "8 hours ago",
  },
];

const recentPayments = [
  { participant: "John Doe", amount: 1200, sport: "Cricket", time: "2h" },
  { participant: "Mike Johnson", amount: 300, sport: "Badminton", time: "5h" },
  { participant: "David Brown", amount: 150, sport: "Chess", time: "8h" },
  { participant: "Emily Davis", amount: 500, sport: "Table Tennis", time: "12h" },
];

const sportOverview = [
  { name: "Cricket", registrations: 16, capacity: 16, revenue: 19200, status: "full" },
  { name: "Football", registrations: 18, capacity: 20, revenue: 14400, status: "open" },
  { name: "Badminton", registrations: 28, capacity: 32, revenue: 8400, status: "open" },
  { name: "Volleyball", registrations: 12, capacity: 12, revenue: 7200, status: "full" },
  { name: "Chess", registrations: 45, capacity: 64, revenue: 6750, status: "open" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your sports registration system
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/sports/new">
            <Button>
              <Trophy className="h-4 w-4 mr-2" />
              Add Sport
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold font-mono">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financialStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/sports">
              <Button variant="outline">
                <Trophy className="h-4 w-4 mr-2" />
                Manage Sports
              </Button>
            </Link>
            <Link href="/admin/registrations">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                View Registrations
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/broadcast">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Registrations</CardTitle>
              <CardDescription>Latest registration activity</CardDescription>
            </div>
            <Link href="/admin/registrations">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {reg.participant.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{reg.participant}</p>
                      <p className="text-xs text-muted-foreground">
                        {reg.sport} • {reg.college}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        reg.status === "confirmed"
                          ? "confirmed"
                          : reg.status === "payment_pending"
                          ? "payment_pending"
                          : "waitlist"
                      }
                      className="mb-1"
                    >
                      {reg.status.replace("_", " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{reg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Payments</CardTitle>
              <CardDescription>Latest successful payments</CardDescription>
            </div>
            <Link href="/admin/registrations?payment_status=completed">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{payment.participant}</p>
                      <p className="text-xs text-muted-foreground">{payment.sport}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{payment.time} ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sports Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sports Overview</CardTitle>
            <CardDescription>Registration status by sport</CardDescription>
          </div>
          <Link href="/admin/sports">
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Sport</th>
                  <th className="pb-3 font-medium">Registrations</th>
                  <th className="pb-3 font-medium">Capacity</th>
                  <th className="pb-3 font-medium">Revenue</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sportOverview.map((sport) => (
                  <tr key={sport.name} className="border-b last:border-0">
                    <td className="py-3 font-medium">{sport.name}</td>
                    <td className="py-3">{sport.registrations}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              sport.registrations >= sport.capacity
                                ? "bg-red-500"
                                : sport.registrations >= sport.capacity * 0.8
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${(sport.registrations / sport.capacity) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-muted-foreground">
                          {sport.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-green-600">
                      ₹{sport.revenue.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={sport.status === "open" ? "success" : "destructive"}
                      >
                        {sport.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
