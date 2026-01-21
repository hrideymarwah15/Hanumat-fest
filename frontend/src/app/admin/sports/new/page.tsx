"use client";

import { useState } from "react";
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
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function NewSportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rules, setRules] = useState<string[]>([""]);
  const [highlights, setHighlights] = useState<string[]>([""]);

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    router.push("/admin/sports");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/sports">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-heading">Add New Sport</h1>
          <p className="text-muted-foreground">
            Create a new sport event for HanumatFest
          </p>
        </div>
      </div>

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
                  placeholder="e.g., Cricket, Football, Badminton"
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
                  placeholder="e.g., cricket, football"
                  pattern="[a-z0-9-]+"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Brief description of the sport..."
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select required>
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
                <Select required>
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
                  placeholder="e.g., 9:00 AM - 6:00 PM"
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
                placeholder="e.g., Main Stadium, Court A"
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
                  placeholder="1"
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
                  placeholder="11"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max Teams/Participants <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="16"
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Deadline</label>
              <input
                type="date"
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
                    placeholder="500"
                    className="w-full pl-8 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Per team/participant fee
                </p>
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
                    placeholder="400"
                    className="w-full pl-8 pr-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional discounted price
                </p>
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
            <CardDescription>
              Add rules and guidelines for participants
            </CardDescription>
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
            <CardDescription>
              Key features and attractions of this sport
            </CardDescription>
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
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Recommended: 1200x630px, max 2MB (JPG, PNG)
              </p>
              <Button type="button" variant="outline">
                Choose Image
              </Button>
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
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Sport
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
