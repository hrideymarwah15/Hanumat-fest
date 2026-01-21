"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  ArrowLeft,
  Trophy,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // TODO: Implement actual password reset with Supabase
      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md space-y-8">
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-7 w-7 text-white" />
            </div>
          </Link>
        </div>

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold">Forgot Password?</h1>
              <p className="text-muted-foreground mt-2">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold">Check Your Email</h1>
              <p className="text-muted-foreground mt-2">
                We've sent a password reset link to:
              </p>
              <p className="font-medium text-primary mt-1">{email}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Verify you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
              >
                Try Another Email
              </Button>
              <Link href="/login" className="block">
                <Button variant="gradient" size="lg" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Help */}
        <p className="text-center text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
