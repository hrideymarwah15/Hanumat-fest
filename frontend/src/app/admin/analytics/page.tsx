"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  Trophy,
  Building2,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock analytics data
const overviewStats = [
  {
    label: "Total Revenue",
    value: "₹1,50,000",
    change: "+23%",
    trend: "up",
    icon: IndianRupee,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    label: "Total Registrations",
    value: "150",
    change: "+18%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    label: "Active Sports",
    value: "10",
    change: "+2",
    trend: "up",
    icon: Trophy,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    label: "Participating Colleges",
    value: "25",
    change: "+5",
    trend: "up",
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
];

const sportsAnalytics = [
  { name: "Cricket", registrations: 16, capacity: 16, revenue: 19200, percentage: 100 },
  { name: "Football", registrations: 18, capacity: 20, revenue: 14400, percentage: 90 },
  { name: "Badminton", registrations: 28, capacity: 32, revenue: 8400, percentage: 87.5 },
  { name: "Volleyball", registrations: 12, capacity: 12, revenue: 7200, percentage: 100 },
  { name: "Chess", registrations: 45, capacity: 64, revenue: 6750, percentage: 70.3 },
  { name: "Table Tennis", registrations: 20, capacity: 32, revenue: 4000, percentage: 62.5 },
  { name: "Valorant", registrations: 20, capacity: 32, revenue: 10000, percentage: 62.5 },
  { name: "100m Sprint", registrations: 35, capacity: 50, revenue: 3500, percentage: 70 },
];

const collegeAnalytics = [
  { name: "IIT Delhi", registrations: 35, sports: 8, revenue: 32500 },
  { name: "IIT Bombay", registrations: 28, sports: 7, revenue: 26800 },
  { name: "BITS Pilani", registrations: 22, sports: 6, revenue: 19500 },
  { name: "IIT Madras", registrations: 20, sports: 5, revenue: 18200 },
  { name: "NIT Trichy", registrations: 18, sports: 5, revenue: 15600 },
  { name: "IIT Kanpur", registrations: 15, sports: 4, revenue: 12500 },
  { name: "IIIT Hyderabad", registrations: 12, sports: 4, revenue: 10800 },
];

const revenueByDay = [
  { date: "Jan 10", amount: 12500 },
  { date: "Jan 11", amount: 18000 },
  { date: "Jan 12", amount: 15500 },
  { date: "Jan 13", amount: 22000 },
  { date: "Jan 14", amount: 19800 },
  { date: "Jan 15", amount: 25600 },
  { date: "Jan 16", amount: 21400 },
  { date: "Today", amount: 15200 },
];

const categoryBreakdown = [
  { category: "Outdoor", registrations: 46, revenue: 40800, percentage: 30.7 },
  { category: "Indoor", registrations: 73, revenue: 21150, percentage: 48.7 },
  { category: "E-Sports", registrations: 20, revenue: 10000, percentage: 13.3 },
  { category: "Athletics", registrations: 35, revenue: 3500, percentage: 23.3 },
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("week");

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights and reports
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label}>
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
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-2">
                  {revenueByDay.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-pointer"
                        style={{
                          height: `${(day.amount / maxRevenue) * 200}px`,
                        }}
                        title={`₹${day.amount.toLocaleString()}`}
                      />
                      <span className="text-xs text-muted-foreground rotate-[-45deg] origin-left">
                        {day.date}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Registrations by sport category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-muted-foreground">
                          {cat.registrations} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            cat.category === "Outdoor"
                              ? "bg-green-500"
                              : cat.category === "Indoor"
                              ? "bg-purple-500"
                              : cat.category === "E-Sports"
                              ? "bg-blue-500"
                              : "bg-orange-500"
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Revenue: ₹{cat.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Sports by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sportsAnalytics.slice(0, 5).map((sport, index) => (
                    <div key={sport.name} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{sport.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sport.registrations} registrations
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">
                        ₹{sport.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Colleges by Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collegeAnalytics.slice(0, 5).map((college, index) => (
                    <div key={college.name} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-medium text-purple-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{college.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {college.sports} sports
                        </p>
                      </div>
                      <span className="font-medium">{college.registrations} regs</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sports Tab */}
        <TabsContent value="sports">
          <Card>
            <CardHeader>
              <CardTitle>Sports Analytics</CardTitle>
              <CardDescription>Detailed breakdown by sport</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-3 font-medium">Sport</th>
                      <th className="pb-3 font-medium">Registrations</th>
                      <th className="pb-3 font-medium">Capacity</th>
                      <th className="pb-3 font-medium">Fill Rate</th>
                      <th className="pb-3 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sportsAnalytics.map((sport) => (
                      <tr key={sport.name} className="border-b last:border-0">
                        <td className="py-4 font-medium">{sport.name}</td>
                        <td className="py-4">{sport.registrations}</td>
                        <td className="py-4">{sport.capacity}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  sport.percentage >= 90
                                    ? "bg-green-500"
                                    : sport.percentage >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${sport.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{sport.percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-4 font-medium text-green-600">
                          ₹{sport.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-muted/30">
                      <td className="py-4 font-semibold">Total</td>
                      <td className="py-4 font-semibold">
                        {sportsAnalytics.reduce((sum, s) => sum + s.registrations, 0)}
                      </td>
                      <td className="py-4 font-semibold">
                        {sportsAnalytics.reduce((sum, s) => sum + s.capacity, 0)}
                      </td>
                      <td className="py-4">-</td>
                      <td className="py-4 font-semibold text-green-600">
                        ₹{sportsAnalytics.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹1,50,000</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹1,000</p>
                    <p className="text-sm text-muted-foreground">Avg. per Registration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹15,200</p>
                    <p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByDay.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-muted-foreground">{day.date}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60"
                        style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 text-right font-medium">
                      ₹{day.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colleges Tab */}
        <TabsContent value="colleges">
          <Card>
            <CardHeader>
              <CardTitle>College-wise Analytics</CardTitle>
              <CardDescription>Participation breakdown by college</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">College</th>
                      <th className="pb-3 font-medium">Registrations</th>
                      <th className="pb-3 font-medium">Sports</th>
                      <th className="pb-3 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collegeAnalytics.map((college, index) => (
                      <tr key={college.name} className="border-b last:border-0">
                        <td className="py-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            index < 3 
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 font-medium">{college.name}</td>
                        <td className="py-4">{college.registrations}</td>
                        <td className="py-4">{college.sports}</td>
                        <td className="py-4 font-medium text-green-600">
                          ₹{college.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
