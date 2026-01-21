"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Archive,
  Trophy,
  Users,
  IndianRupee,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock sports data
const mockSports = [
  {
    id: "1",
    name: "Cricket Tournament",
    slug: "cricket-championship",
    category: "outdoor",
    fees: 1500,
    earlyBirdFees: 1200,
    registrations: 16,
    maxParticipants: 16,
    isOpen: false,
    isArchived: false,
    registrationDeadline: new Date("2024-03-15"),
    eventDate: new Date("2024-03-20"),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Football Championship",
    slug: "football-championship",
    category: "outdoor",
    fees: 800,
    earlyBirdFees: 700,
    registrations: 18,
    maxParticipants: 20,
    isOpen: true,
    isArchived: false,
    registrationDeadline: new Date("2024-03-10"),
    eventDate: new Date("2024-03-18"),
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "Badminton Singles",
    slug: "badminton-singles",
    category: "indoor",
    fees: 300,
    earlyBirdFees: 250,
    registrations: 28,
    maxParticipants: 32,
    isOpen: true,
    isArchived: false,
    registrationDeadline: new Date("2024-03-12"),
    eventDate: new Date("2024-03-22"),
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "4",
    name: "Chess Tournament",
    slug: "chess-tournament",
    category: "indoor",
    fees: 150,
    earlyBirdFees: 100,
    registrations: 45,
    maxParticipants: 64,
    isOpen: true,
    isArchived: false,
    registrationDeadline: new Date("2024-03-08"),
    eventDate: new Date("2024-03-19"),
    createdAt: new Date("2024-01-04"),
  },
  {
    id: "5",
    name: "Valorant Tournament",
    slug: "valorant-tournament",
    category: "esports",
    fees: 500,
    earlyBirdFees: 400,
    registrations: 20,
    maxParticipants: 32,
    isOpen: true,
    isArchived: false,
    registrationDeadline: new Date("2024-03-05"),
    eventDate: new Date("2024-03-17"),
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "6",
    name: "100m Sprint",
    slug: "100m-sprint",
    category: "athletics",
    fees: 100,
    earlyBirdFees: 80,
    registrations: 35,
    maxParticipants: 50,
    isOpen: true,
    isArchived: false,
    registrationDeadline: new Date("2024-03-14"),
    eventDate: new Date("2024-03-21"),
    createdAt: new Date("2024-01-06"),
  },
];

const categories = ["all", "outdoor", "indoor", "esports", "athletics"];

export default function AdminSportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredSports = mockSports.filter((sport) => {
    const matchesSearch = sport.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || sport.category === category;
    const matchesArchived = showArchived || !sport.isArchived;
    return matchesSearch && matchesCategory && matchesArchived;
  });

  const getCapacityColor = (registrations: number, max: number) => {
    const percentage = (registrations / max) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Sports Management</h1>
          <p className="text-muted-foreground">
            Create and manage sports for registration
          </p>
        </div>
        <Link href="/admin/sports/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sport
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList>
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className={showArchived ? "bg-muted" : ""}
              >
                <Archive className="h-4 w-4 mr-2" />
                {showArchived ? "Hide Archived" : "Show Archived"}
              </Button>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sports Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSports.map((sport) => (
            <Card key={sport.id} className={sport.isArchived ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{sport.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant={sport.category as "outdoor" | "indoor" | "esports" | "athletics"}>
                        {sport.category}
                      </Badge>
                      {sport.isArchived && (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/sports/${sport.slug}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          View Public Page
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/sports/${sport.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {sport.isOpen ? (
                          <>
                            <ToggleLeft className="h-4 w-4 mr-2" />
                            Close Registration
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4 mr-2" />
                            Open Registration
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Archive className="h-4 w-4 mr-2" />
                        {sport.isArchived ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span>₹{sport.fees}</span>
                    {sport.earlyBirdFees && (
                      <span className="text-xs text-green-600">
                        (₹{sport.earlyBirdFees})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {sport.registrationDeadline.toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Registrations</span>
                    <span className="font-medium">
                      {sport.registrations} / {sport.maxParticipants}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCapacityColor(
                        sport.registrations,
                        sport.maxParticipants
                      )}`}
                      style={{
                        width: `${Math.min(
                          (sport.registrations / sport.maxParticipants) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant={sport.isOpen ? "success" : "secondary"}>
                    {sport.isOpen ? "Open" : "Closed"}
                  </Badge>
                  <Link href={`/admin/registrations?sport=${sport.id}`}>
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      View Registrations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b">
                    <th className="p-4 font-medium">Sport</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Fee</th>
                    <th className="p-4 font-medium">Registrations</th>
                    <th className="p-4 font-medium">Deadline</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSports.map((sport) => (
                    <tr
                      key={sport.id}
                      className={`border-b last:border-0 hover:bg-muted/50 ${
                        sport.isArchived ? "opacity-60" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-medium">{sport.name}</div>
                        <div className="text-xs text-muted-foreground">{sport.slug}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant={sport.category as "outdoor" | "indoor" | "esports" | "athletics"}>
                          {sport.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div>₹{sport.fees}</div>
                        {sport.earlyBirdFees && (
                          <div className="text-xs text-green-600">
                            Early: ₹{sport.earlyBirdFees}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getCapacityColor(
                                sport.registrations,
                                sport.maxParticipants
                              )}`}
                              style={{
                                width: `${(sport.registrations / sport.maxParticipants) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm">
                            {sport.registrations}/{sport.maxParticipants}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {sport.registrationDeadline.toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge variant={sport.isOpen ? "success" : "secondary"}>
                          {sport.isOpen ? "Open" : "Closed"}
                        </Badge>
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
                              <Link href={`/sports/${sport.slug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/sports/${sport.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredSports.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sports found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || category !== "all"
                ? "Try adjusting your filters"
                : "Get started by adding your first sport"}
            </p>
            <Link href="/admin/sports/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Sport
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
