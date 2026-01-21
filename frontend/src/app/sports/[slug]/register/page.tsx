"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  CheckCircle,
  Trophy,
  Mail,
  Phone,
  Building2,
  Plus,
  Trash2,
  Crown,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  FileText,
  Shield,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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

// Mock sport data
const mockSportData = {
  id: "cricket-1",
  name: "Cricket Tournament",
  slug: "cricket-championship",
  category: "outdoor",
  description: "Inter-college cricket championship featuring teams from across the state.",
  rules: "Standard ICC rules apply. 20 overs per side.",
  fees: 1500,
  earlyBirdFees: 1200,
  earlyBirdDeadline: new Date("2024-02-28"),
  registrationDeadline: new Date("2024-03-15"),
  eventDate: new Date("2024-03-20"),
  venue: "Main Cricket Ground",
  isTeamEvent: true,
  minTeamSize: 11,
  maxTeamSize: 15,
  spotsRemaining: 8,
  maxParticipants: 16,
  image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop",
};

// Mock user profile
const mockUserProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "9876543210",
  college: "IIT Delhi",
};

type Step = "details" | "team" | "review";

export default function RegisterPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sport, setSport] = useState<typeof mockSportData | null>(null);
  const [userProfile, setUserProfile] = useState<typeof mockUserProfile | null>(null);
  
  // Team state
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "", email: "", phone: "", isCaptain: true },
  ]);
  
  // Agreements
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);

  useEffect(() => {
    // Simulate loading sport data and user profile
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSport(mockSportData);
      setUserProfile(mockUserProfile);
      // Pre-fill first team member with user profile
      setTeamMembers([
        {
          id: "1",
          name: mockUserProfile.name,
          email: mockUserProfile.email,
          phone: mockUserProfile.phone,
          isCaptain: true,
        },
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [resolvedParams.slug]);

  const isEarlyBird = sport && new Date() < sport.earlyBirdDeadline;
  const currentFee = isEarlyBird ? sport?.earlyBirdFees : sport?.fees;

  const steps = [
    { key: "details" as Step, label: "Your Details", icon: User },
    ...(sport?.isTeamEvent ? [{ key: "team" as Step, label: "Team Details", icon: Users }] : []),
    { key: "review" as Step, label: "Review & Confirm", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const addTeamMember = () => {
    if (sport && teamMembers.length < sport.maxTeamSize) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now().toString(), name: "", email: "", phone: "", isCaptain: false },
      ]);
    }
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > sport!.minTeamSize) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | boolean) => {
    setTeamMembers(
      teamMembers.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        // If setting someone as captain, remove captain from others
        if (field === "isCaptain" && value === true) {
          return { ...m, isCaptain: m.id === id };
        }
        return m;
      })
    );
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case "details":
        return !!userProfile;
      case "team":
        if (!sport?.isTeamEvent) return true;
        const hasCaptain = teamMembers.some((m) => m.isCaptain);
        const hasMinMembers = teamMembers.length >= sport.minTeamSize;
        const allMembersValid = teamMembers.every((m) => m.name.trim().length >= 2);
        return teamName.trim().length >= 3 && hasCaptain && hasMinMembers && allMembersValid;
      case "review":
        return agreeTerms && agreeRefund;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate registration creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Redirect to payment page
      router.push(`/dashboard/registrations/reg-001/pay`);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <Skeleton className="h-[400px] rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!sport) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sport Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The sport you&apos;re looking for doesn&apos;t exist or registration is closed.
            </p>
            <Link href="/sports">
              <Button>Browse Sports</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background via-secondary/5 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href={`/sports/${sport.slug}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {sport.name}
              </Link>
              <h1 className="text-3xl font-bold font-heading mb-2">
                Register for {sport.name}
              </h1>
              <p className="text-muted-foreground">
                Complete the form below to register for this event
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${
                            index < currentStepIndex
                              ? "bg-green-500 text-white"
                              : index === currentStepIndex
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }
                        `}
                      >
                        {index < currentStepIndex ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`ml-3 font-medium hidden sm:block ${
                          index === currentStepIndex
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          index < currentStepIndex ? "bg-green-500" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sport Info Card */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/20 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{sport.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {sport.isTeamEvent
                          ? `Team Event (${sport.minTeamSize}-${sport.maxTeamSize} members)`
                          : "Individual Event"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">₹{currentFee}</span>
                      {isEarlyBird && (
                        <Badge variant="success" className="ml-2">Early Bird</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
              <CardContent className="py-6">
                {/* Step 1: Your Details */}
                {currentStep === "details" && userProfile && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Confirm Your Details</h2>
                      <p className="text-sm text-muted-foreground">
                        Please verify your profile information before proceeding
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{userProfile.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{userProfile.email}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{userProfile.phone}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">College</label>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{userProfile.college}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Need to update your details?
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            You can update your profile information before registering.
                          </p>
                          <Link
                            href="/dashboard/profile"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Edit Profile →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Team Details */}
                {currentStep === "team" && sport.isTeamEvent && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Team Information</h2>
                      <p className="text-sm text-muted-foreground">
                        Enter your team details. You need {sport.minTeamSize}-{sport.maxTeamSize} team members.
                      </p>
                    </div>

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
                            {teamMembers.length} / {sport.maxTeamSize} members
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTeamMember}
                          disabled={teamMembers.length >= sport.maxTeamSize}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Member
                        </Button>
                      </div>

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
                                {teamMembers.length > sport.minTeamSize && (
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

                      {teamMembers.length < sport.minTeamSize && (
                        <div className="text-sm text-destructive">
                          You need at least {sport.minTeamSize - teamMembers.length} more team member(s)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Confirm */}
                {currentStep === "review" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Review Your Registration</h2>
                      <p className="text-sm text-muted-foreground">
                        Please review all details before proceeding to payment
                      </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="space-y-4">
                      {/* Sport Details */}
                      <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          Sport Details
                        </h3>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sport</span>
                            <span className="font-medium">{sport.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <Badge variant={sport.category as "outdoor" | "indoor"}>{sport.category}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Event Date</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {sport.eventDate.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Venue</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {sport.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Participant Details */}
                      <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Participant Details
                        </h3>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span className="font-medium">{userProfile?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>{userProfile?.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">College</span>
                            <span>{userProfile?.college}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Details */}
                      {sport.isTeamEvent && (
                        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                          <h3 className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Team Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Team Name</span>
                              <span className="font-medium">{teamName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Team Size</span>
                              <span>{teamMembers.length} members</span>
                            </div>
                            <div className="mt-3 space-y-1">
                              {teamMembers.map((member, index) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between text-xs p-2 bg-background rounded"
                                >
                                  <span>
                                    {index + 1}. {member.name}
                                  </span>
                                  {member.isCaptain && (
                                    <Badge variant="secondary" className="text-xs">
                                      Captain
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-primary" />
                          Payment Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registration Fee</span>
                            <span>₹{sport.fees}</span>
                          </div>
                          {isEarlyBird && (
                            <div className="flex justify-between text-green-600">
                              <span>Early Bird Discount</span>
                              <span>-₹{sport.fees - sport.earlyBirdFees}</span>
                            </div>
                          )}
                          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-primary">₹{currentFee}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Agreements */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms and Conditions
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeRefund}
                          onChange={(e) => setAgreeRefund(e.target.checked)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          I understand and agree to the{" "}
                          <Link href="/refund-policy" className="text-primary hover:underline">
                            Refund Policy
                          </Link>
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  {currentStep !== "review" ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!validateStep(currentStep)}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!validateStep("review") || isSubmitting}
                      className="min-w-[200px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm & Pay ₹{currentFee}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="mt-6">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Need Help?</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      If you have any questions about registration, check our FAQ or contact support.
                    </p>
                    <div className="flex gap-4">
                      <Link href={`/sports/${sport.slug}#faq`} className="text-sm text-primary hover:underline">
                        View FAQ
                      </Link>
                      <Link href="/contact" className="text-sm text-primary hover:underline">
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
