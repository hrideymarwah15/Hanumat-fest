"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  UserPlus,
  Crown,
  MoreVertical,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// Mock teams data
const teams = [
  {
    id: 1,
    name: "Thunder Bolts",
    sport: {
      name: "Cricket",
      icon: "🏏",
    },
    members: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        role: "captain",
        avatar: null,
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+91 87654 32109",
        role: "member",
        avatar: null,
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        phone: "+91 76543 21098",
        role: "member",
        avatar: null,
      },
    ],
    maxMembers: 15,
    status: "active",
  },
  {
    id: 2,
    name: "Goal Getters",
    sport: {
      name: "Football",
      icon: "⚽",
    },
    members: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        role: "captain",
        avatar: null,
      },
      {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah@example.com",
        phone: "+91 65432 10987",
        role: "member",
        avatar: null,
      },
    ],
    maxMembers: 7,
    status: "active",
  },
  {
    id: 3,
    name: "Phantom Squad",
    sport: {
      name: "Valorant",
      icon: "🎮",
    },
    members: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        role: "captain",
        avatar: null,
      },
      {
        id: 5,
        name: "Alex Brown",
        email: "alex@example.com",
        phone: "+91 54321 09876",
        role: "member",
        avatar: null,
      },
      {
        id: 6,
        name: "Chris Lee",
        email: "chris@example.com",
        phone: "+91 43210 98765",
        role: "member",
        avatar: null,
      },
      {
        id: 7,
        name: "Emily Davis",
        email: "emily@example.com",
        phone: "+91 32109 87654",
        role: "member",
        avatar: null,
      },
      {
        id: 8,
        name: "David Miller",
        email: "david@example.com",
        phone: "+91 21098 76543",
        role: "member",
        avatar: null,
      },
    ],
    maxMembers: 6,
    status: "active",
  },
];

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<(typeof teams)[0] | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.sport.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMember = () => {
    // TODO: Implement add member logic
    setShowAddMember(false);
    setNewMember({ name: "", email: "", phone: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and team members
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-4">
            Register for a team sport to create your team
          </p>
          <Link href="/sports">
            <Button variant="gradient">Browse Sports</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-card rounded-xl border overflow-hidden card-hover"
            >
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {team.sport.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.sport.name}
                    </p>
                  </div>
                  <Badge variant="success">{team.status}</Badge>
                </div>
              </div>

              {/* Members Preview */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Team Members
                  </span>
                  <span className="text-sm font-medium">
                    {team.members.length}/{team.maxMembers}
                  </span>
                </div>

                {/* Avatar Stack */}
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    {team.members.slice(0, 5).map((member) => (
                      <Avatar
                        key={member.id}
                        className="w-8 h-8 border-2 border-card"
                      >
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTeam(team)}
                    >
                      Manage
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 pb-4">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      team.members.length >= team.maxMembers
                        ? "bg-green-500"
                        : team.members.length >= team.maxMembers * 0.7
                        ? "bg-yellow-500"
                        : "bg-primary"
                    }`}
                    style={{
                      width: `${(team.members.length / team.maxMembers) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Management Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        {selectedTeam && (
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{selectedTeam.sport.icon}</span>
                {selectedTeam.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTeam.sport.name} • {selectedTeam.members.length}/
                {selectedTeam.maxMembers} members
              </DialogDescription>
            </DialogHeader>

            {/* Add Member Button */}
            {selectedTeam.members.length < selectedTeam.maxMembers && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAddMember(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            )}

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="font-medium">Team Members</h4>
              {selectedTeam.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Avatar>
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{member.name}</span>
                      {member.role === "captain" && (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="h-3 w-3" />
                          Captain
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </span>
                    </div>
                  </div>
                  {member.role !== "captain" && (
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Capacity Warning */}
            {selectedTeam.members.length < selectedTeam.maxMembers && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                    Team not complete
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You need at least {selectedTeam.maxMembers} members to
                    participate. Add{" "}
                    {selectedTeam.maxMembers - selectedTeam.members.length} more
                    member(s).
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new team member
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Enter full name"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
