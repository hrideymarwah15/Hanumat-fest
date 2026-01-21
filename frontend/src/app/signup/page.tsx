'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnimatedBackground, GlowOrbs } from '@/components/ui/AnimatedBackground';
import { supabase } from '@/lib/supabase';

interface College {
  id: string;
  name: string;
  short_name: string;
}

const steps = [
  { id: 1, title: 'Account', description: 'Create your account' },
  { id: 2, title: 'Profile', description: 'Tell us about yourself' },
  { id: 3, title: 'Confirm', description: 'Review & submit' },
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    college: '',
    phone: '',
  });
  const router = useRouter();
  const { signUp, error, clearError, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      const { data } = await supabase
        .from('colleges')
        .select('id, name, short_name')
        .order('name');
      
      if (data) {
        setColleges(data);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.signup-header', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        delay: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const validateStep = () => {
    setFormError('');
    
    if (currentStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setFormError('Please fill in all fields');
        return false;
      }
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.name || !formData.phone || !formData.college) {
        setFormError('Please fill in all fields');
        return false;
      }
      if (!/^[0-9]{10}$/.test(formData.phone)) {
        setFormError('Please enter a valid 10-digit phone number');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setIsLoading(true);
    clearError();
    setFormError('');

    const { error: signUpError } = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      college: formData.college,
    });

    if (signUpError) {
      setFormError(signUpError);
      setIsLoading(false);
    } else {
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@college.edu"
                className="input-glass"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-glass"
                required
                minLength={8}
              />
              <p className="text-xs text-white/40 mt-1">At least 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="input-glass"
                required
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="input-glass"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9876543210"
                className="input-glass"
                required
                pattern="[0-9]{10}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">College</label>
              <select
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                className="input-glass"
                required
              >
                <option value="">Select your college</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.name}>
                    {college.short_name} - {college.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-card-subtle p-6 space-y-4">
              <h3 className="font-semibold text-white/90 mb-4">Review Your Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50">Email</span>
                  <span className="text-white">{formData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50">Name</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/50">Phone</span>
                  <span className="text-white">{formData.phone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/50">College</span>
                  <span className="text-white">{formData.college}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <p className="text-sm text-white/70">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden py-12">
      <AnimatedBackground variant="particles" />
      <GlowOrbs colors={['#b20e38', '#22c55e', '#3b82f6']} />

      {/* Back link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span>←</span>
        <span className="text-sm uppercase tracking-wider">Back</span>
      </Link>

      {/* Signup container */}
      <div className="relative z-10 w-full max-w-lg mx-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 md:p-12"
        >
          {/* Logo */}
          <Link href="/" className="signup-header block text-center mb-6">
            <span className="text-3xl font-black tracking-tighter">
              <span className="gradient-text">HANUMAT</span>
              <span className="text-white/80">FEST</span>
            </span>
          </Link>

          {/* Title */}
          <div className="signup-header text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/50">Join the ultimate sports fest</p>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
            {steps.map((step, index) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-white' : 'text-white/40'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {(formError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {formError || error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 btn-primary py-4"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !!successMessage}
                  className="flex-1 btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login link */}
          <p className="text-center text-white/50 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
