"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Check,
  X,
  Loader2,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least one number", test: (p: string) => /\d/.test(p) },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);

  // Check for token in URL
  useEffect(() => {
    // In a real implementation, we'd verify the token here
    // For now, we'll assume the token is valid if present
    const code = searchParams.get("code");
    if (!code) {
      setTokenError(true);
    }
  }, [searchParams]);

  const getPasswordStrength = () => {
    const passed = passwordRequirements.filter((req) => req.test(password)).length;
    if (passed === 0) return { label: "", color: "" };
    if (passed <= 2) return { label: "Weak", color: "bg-red-500" };
    if (passed === 3) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const allRequirementsMet = passwordRequirements.every((req) => req.test(password));
    if (!allRequirementsMet) {
      setError("Password does not meet all requirements");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // In a real implementation:
      // await supabase.auth.updateUser({ password: password });
      
      setIsSuccess(true);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength();

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce-gentle">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full">
                Continue to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold font-heading">Reset Password</h1>
            </div>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${strength.color}`}
                            style={{
                              width: `${
                                (passwordRequirements.filter((req) => req.test(password)).length /
                                  passwordRequirements.length) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{strength.label}</span>
                      </div>

                      <div className="space-y-1">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-xs ${
                              req.test(password) ? "text-green-600" : "text-muted-foreground"
                            }`}
                          >
                            {req.test(password) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            {req.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !password || !confirmPassword || password !== confirmPassword}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Security Tips</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use a unique password not used on other sites</li>
                  <li>• Consider using a password manager</li>
                  <li>• Never share your password with anyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/20 p-12">
        <div className="max-w-lg text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-heading mb-4">
            Secure Your Account
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            A strong password is your first line of defense. Choose a password 
            that&apos;s unique and memorable to you.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-background/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Mix It Up</h3>
              <p className="text-sm text-muted-foreground">
                Combine letters, numbers, and symbols
              </p>
            </div>
            <div className="bg-background/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Stay Unique</h3>
              <p className="text-sm text-muted-foreground">
                Don&apos;t reuse passwords from other sites
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
