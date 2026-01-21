"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@hanumatfest.com",
    href: "mailto:contact@hanumatfest.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "Main Campus, University Road, City - 123456",
    href: "#",
  },
  {
    icon: Clock,
    title: "Office Hours",
    value: "Mon - Sat: 9:00 AM - 6:00 PM",
    href: null,
  },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const faqs = [
  {
    question: "How do I register for a sport?",
    answer:
      "Create an account, browse available sports, select your preferred sport, fill in team details (if applicable), and complete the payment to confirm your registration.",
  },
  {
    question: "Can I register for multiple sports?",
    answer:
      "Yes, you can register for multiple sports as long as the schedules don't conflict. Each sport requires a separate registration and payment.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "Full refund available until 7 days before the event. 50% refund up to 3 days before the event. No refund within 3 days of the event.",
  },
  {
    question: "How do I add team members?",
    answer:
      "After registration, go to your Dashboard > My Teams. Select the team and click 'Add Member' to invite team members via their email or phone number.",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSuccess(true);
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 pt-32 bg-gradient-to-br from-primary to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 text-primary">
            Get in Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{info.title}</h3>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-medium mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                <p className="text-muted-foreground mb-6">
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>

                {success && (
                  <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      Message sent successfully! We'll get back to you soon.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="w-full min-h-[150px] px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Type your message here..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <MessageSquare className="h-3 w-3 mr-1" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about HanumatFest.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Find Us</h2>
            <p className="text-muted-foreground">Visit us at our campus</p>
          </div>
          <div className="aspect-video rounded-2xl bg-muted overflow-hidden">
            {/* Placeholder for map - in production, integrate Google Maps */}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p>Map will be displayed here</p>
                <p className="text-sm">Main Campus, University Road</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
