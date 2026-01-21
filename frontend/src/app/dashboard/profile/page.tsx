"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  Edit,
  Camera,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Mock user data
const userData = {
  id: "USR-001",
  fullName: "John Doe",
  email: "john@example.com",
  phone: "+91 98765 43210",
  college: "XYZ Engineering College",
  rollNumber: "2022CSE001",
  course: "B.Tech Computer Science",
  year: "3rd Year",
  dob: "2003-05-15",
  gender: "Male",
  address: "123 Main Street, City, State - 123456",
  avatar: null,
  createdAt: "Feb 01, 2026",
  verified: true,
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
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
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Profile updated successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-card rounded-xl border overflow-hidden">
        {/* Cover & Avatar */}
        <div className="relative h-32 bg-gradient-to-br from-primary to-primary-600">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={formData.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {formData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-16 px-6 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold">{formData.fullName}</h2>
            {formData.verified && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{formData.college}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Member since {formData.createdAt}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">{formData.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </label>
            <p className="text-muted-foreground">{formData.email}</p>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </label>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">{formData.phone}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date of Birth
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">
                {new Date(formData.dob).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* College Information */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">College Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* College */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              College Name
            </label>
            {isEditing ? (
              <Input
                value={formData.college}
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">{formData.college}</p>
            )}
          </div>

          {/* Roll Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Roll Number</label>
            {isEditing ? (
              <Input
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({ ...formData, rollNumber: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">{formData.rollNumber}</p>
            )}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            {isEditing ? (
              <Input
                value={formData.course}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">{formData.course}</p>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            {isEditing ? (
              <Input
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">{formData.year}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Address</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Full Address
          </label>
          {isEditing ? (
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          ) : (
            <p className="text-muted-foreground">{formData.address}</p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-xl border border-red-200 dark:border-red-900 p-6">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button variant="destructive">Delete Account</Button>
      </div>
    </div>
  );
}
