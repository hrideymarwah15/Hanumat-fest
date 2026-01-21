"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trophy,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  Info,
  ImageIcon,
  Plus,
  X,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";

const categories = [
  { value: "outdoor", label: "Outdoor Sports" },
  { value: "indoor", label: "Indoor Sports" },
  { value: "esports", label: "E-Sports" },
  { value: "athletics", label: "Athletics" },
];

const sportTypes = [
  { value: "individual", label: "Individual" },
  { value: "team", label: "Team" },
];

// Mock sport data
const mockSport = {
  id: "1",
  name: "Cricket",
  slug: "cricket",
  description: "Join our exciting cricket tournament! Compete against teams from various colleges in a thrilling T20 format. Show off your batting, bowling, and fielding skills in this premier outdoor sport event.",
  category: "outdoor",
  type: "team",
  date: "2024-02-15",
  time: "9:00 AM - 6:00 PM",
  venue: "Main Cricket Stadium",
  minTeamSize: 11,
  maxTeamSize: 15,
  maxTeams: 16,
  currentRegistrations: 12,
  registrationDeadline: "2024-02-10",
  fee: 1200,
  earlyBirdFee: 1000,
  rules: [
    "Each team must have 11-15 players",
    "T20 format will be followed",
    "Standard ICC rules apply",
    "College ID mandatory for all players",
    "Teams must report 30 minutes before their match",
  ],
  highlights: [
    "Professional umpires",
    "Live streaming of finals",
    "Cash prizes for top 3 teams",
    "Best player awards",
  ],
  registrationOpen: true,
  status: "active",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSportPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rules, setRules] = useState<string[]>(mockSport.rules);
  const [highlights, setHighlights] = useState<string[]>(mockSport.highlights);

  const addRule = () => setRules([...rules, ""]);
  const removeRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index));
    }
  };
  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const addHighlight = () => setHighlights([...highlights, ""]);
  const removeHighlight = (index: number) => {
    if (highlights.length > 1) {
      setHighlights(highlights.filter((_, i) => i !== index));
    }
  };
  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    router.push("/admin/sports");
  };

  const handleDelete = async () => {
    // Simulate deletion
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowDeleteDialog(false);
    router.push("/admin/sports");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/sports">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-heading">Edit Sport</h1>
            <p className="text-muted-foreground">
              Editing: {mockSport.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mockSport.registrationOpen ? "success" : "secondary"}>
            {mockSport.registrationOpen ? "Open" : "Closed"}
          </Badge>
          <Badge variant="outline">{mockSport.currentRegistrations}/{mockSport.maxTeams} teams</Badge>
        </div>
      </div>

      {/* Warning if registrations exist */}
      {mockSport.currentRegistrations > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Active Registrations
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This sport has {mockSport.currentRegistrations} registrations. Some changes may affect existing registrations.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core details about the sport
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Sport Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  defaultValue={mockSport.name}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  defaultValue={mockSport.slug}
                  pattern="[a-z0-9-]+"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                defaultValue={mockSport.description}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select defaultValue={mockSport.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Sport Type <span className="text-red-500">*</span>
                </label>
                <Select defaultValue={mockSport.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Registration Status</p>
                <p className="text-sm text-muted-foreground">
                  Enable or disable registrations for this sport
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={mockSport.registrationOpen}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Venue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule & Venue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  defaultValue={mockSport.date}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Event Time
                </label>
                <input
                  type="text"
                  defaultValue={mockSport.time}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                defaultValue={mockSport.venue}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Registration & Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Registration & Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Team Size (Min) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  defaultValue={mockSport.minTeamSize}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Team Size (Max) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  defaultValue={mockSport.maxTeamSize}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max Teams <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  defaultValue={mockSport.maxTeams}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Registrations</span>
                <span className="text-sm">
                  {mockSport.currentRegistrations} / {mockSport.maxTeams} teams
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${(mockSport.currentRegistrations / mockSport.maxTeams) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Deadline</label>
              <input
                type="date"
                defaultValue={mockSport.registrationDeadline}
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Registration Fee (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    defaultValue={mockSport.fee}
                    className="w-full pl-8 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Early Bird Fee (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    defaultValue={mockSport.earlyBirdFee}
                    className="w-full pl-8 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Rules & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-2">
                <span className="w-6 h-10 flex items-center justify-center text-sm text-muted-foreground">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  placeholder="Enter a rule..."
                  className="flex-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeRule(index)}
                  disabled={rules.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Event Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  placeholder="e.g., Professional referees, Live streaming"
                  className="flex-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeHighlight(index)}
                  disabled={highlights.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addHighlight}>
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Sport Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="w-full h-40 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg mb-4 flex items-center justify-center">
                <Trophy className="h-16 w-16 text-green-600/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Current image (click to replace)
              </p>
              <Button type="button" variant="outline">
                Change Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for this sport
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <p className="font-medium">Delete Sport</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this sport and all its registrations
                </p>
              </div>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Sport?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete{" "}
                      <strong>{mockSport.name}</strong> and all {mockSport.currentRegistrations} associated
                      registrations.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete Sport
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
          <Link href="/admin/sports">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
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
      </form>
    </div>
  );
}
