"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Crown,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  isCaptain: boolean;
}

// Mock data
const mockTeamData = {
  registration: {
    id: "reg-001",
    registrationNumber: "REG-CRI-0001",
    status: "payment_pending",
  },
  sport: {
    name: "Cricket Tournament",
    minTeamSize: 11,
    maxTeamSize: 15,
  },
  team: {
    name: "Team Alpha",
    members: [
      { id: "1", name: "John Doe", email: "john.doe@example.com", phone: "9876543210", isCaptain: true },
      { id: "2", name: "Jane Smith", email: "jane.smith@example.com", phone: "9876543211", isCaptain: false },
      { id: "3", name: "Mike Johnson", email: "mike.j@example.com", phone: "9876543212", isCaptain: false },
      { id: "4", name: "Sarah Williams", email: "", phone: "", isCaptain: false },
      { id: "5", name: "David Brown", email: "", phone: "", isCaptain: false },
      { id: "6", name: "Emily Davis", email: "", phone: "", isCaptain: false },
      { id: "7", name: "Chris Wilson", email: "", phone: "", isCaptain: false },
      { id: "8", name: "Amanda Taylor", email: "", phone: "", isCaptain: false },
      { id: "9", name: "Ryan Martinez", email: "", phone: "", isCaptain: false },
      { id: "10", name: "Lisa Anderson", email: "", phone: "", isCaptain: false },
      { id: "11", name: "Kevin Thomas", email: "", phone: "", isCaptain: false },
    ],
  },
};

export default function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [originalData, setOriginalData] = useState<typeof mockTeamData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadTeamData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOriginalData(mockTeamData);
      setTeamName(mockTeamData.team.name);
      setTeamMembers(mockTeamData.team.members);
      setIsLoading(false);
    };
    loadTeamData();
  }, [resolvedParams.id]);

  const addTeamMember = () => {
    if (originalData && teamMembers.length < originalData.sport.maxTeamSize) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now().toString(), name: "", email: "", phone: "", isCaptain: false },
      ]);
    }
  };

  const removeTeamMember = (id: string) => {
    if (originalData && teamMembers.length > originalData.sport.minTeamSize) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | boolean) => {
    setTeamMembers(
      teamMembers.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        if (field === "isCaptain" && value === true) {
          return { ...m, isCaptain: m.id === id };
        }
        return m;
      })
    );
  };

  const validateForm = (): boolean => {
    if (!originalData) return false;
    
    if (teamName.trim().length < 3) {
      setError("Team name must be at least 3 characters");
      return false;
    }

    if (teamMembers.length < originalData.sport.minTeamSize) {
      setError(`You need at least ${originalData.sport.minTeamSize} team members`);
      return false;
    }

    const hasCaptain = teamMembers.some((m) => m.isCaptain);
    if (!hasCaptain) {
      setError("Please designate a team captain");
      return false;
    }

    const invalidMembers = teamMembers.filter((m) => m.name.trim().length < 2);
    if (invalidMembers.length > 0) {
      setError("All team members must have a valid name");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/dashboard/registrations/${resolvedParams.id}`);
      }, 1500);
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = (): boolean => {
    if (!originalData) return false;
    
    if (teamName !== originalData.team.name) return true;
    if (teamMembers.length !== originalData.team.members.length) return true;
    
    for (let i = 0; i < teamMembers.length; i++) {
      const current = teamMembers[i];
      const original = originalData.team.members.find((m) => m.id === current.id);
      if (!original) return true;
      if (
        current.name !== original.name ||
        current.email !== original.email ||
        current.phone !== original.phone ||
        current.isCaptain !== original.isCaptain
      ) {
        return true;
      }
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!originalData) {
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

  // Check if editing is allowed
  if (!["pending", "payment_pending"].includes(originalData.registration.status)) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Cannot Edit Team</h1>
            <p className="text-muted-foreground mb-6">
              Team details can only be edited while the registration is pending. 
              Your registration status is <Badge>{originalData.registration.status}</Badge>.
            </p>
            <Link href={`/dashboard/registrations/${originalData.registration.id}`}>
              <Button>Back to Registration</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/registrations/${originalData.registration.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registration
        </Link>
        <h1 className="text-2xl font-bold font-heading">Edit Team</h1>
        <p className="text-muted-foreground">
          {originalData.sport.name} • {originalData.registration.registrationNumber}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Changes saved successfully!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Redirecting to registration details...
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team Information
          </CardTitle>
          <CardDescription>
            Update your team details. You need {originalData.sport.minTeamSize}-{originalData.sport.maxTeamSize} team members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Name */}
          <div className="space-y-2">
            <label htmlFor="teamName" className="text-sm font-medium">
              Team Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="teamName"
              placeholder="Enter your team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Choose a unique name for your team (3-100 characters)
            </p>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Team Members</label>
                <p className="text-xs text-muted-foreground">
                  {teamMembers.length} / {originalData.sport.maxTeamSize} members
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTeamMember}
                disabled={teamMembers.length >= originalData.sport.maxTeamSize}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  teamMembers.length >= originalData.sport.minTeamSize
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
                style={{
                  width: `${(teamMembers.length / originalData.sport.maxTeamSize) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.length >= originalData.sport.minTeamSize ? (
                <span className="text-green-600">✓ Minimum team size met</span>
              ) : (
                <span className="text-yellow-600">
                  Need {originalData.sport.minTeamSize - teamMembers.length} more member(s)
                </span>
              )}
            </p>

            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border ${
                    member.isCaptain
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        Member {index + 1}
                      </span>
                      {member.isCaptain && (
                        <Badge variant="default" className="gap-1">
                          <Crown className="h-3 w-3" />
                          Captain
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!member.isCaptain && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTeamMember(member.id, "isCaptain", true)}
                          className="text-xs"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Make Captain
                        </Button>
                      )}
                      {teamMembers.length > originalData.sport.minTeamSize && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(member.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Input
                        placeholder="Full Name *"
                        value={member.name}
                        onChange={(e) =>
                          updateTeamMember(member.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="email"
                        placeholder="Email (optional)"
                        value={member.email}
                        onChange={(e) =>
                          updateTeamMember(member.id, "email", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={member.phone}
                        onChange={(e) =>
                          updateTeamMember(member.id, "phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Link href={`/dashboard/registrations/${originalData.registration.id}`}>
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges() || success}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Important Notes</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• You must have exactly one team captain</li>
                <li>• Team size must be between {originalData.sport.minTeamSize} and {originalData.sport.maxTeamSize} members</li>
                <li>• All team members must have a valid name</li>
                <li>• Changes can only be made before payment is completed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
