"use client";

import { useState } from "react";
import {
  Settings,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Save,
  ExternalLink,
  Copy,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock settings data
const eventSettings = {
  name: "HanumatFest 2024",
  tagline: "Where Champions Rise",
  dates: "February 15-17, 2024",
  venue: "Hanumat Sports Complex, Delhi",
  registrationOpen: true,
  registrationDeadline: "February 10, 2024",
  maxParticipants: 1000,
  currentParticipants: 150,
};

const paymentSettings = {
  razorpayKeyId: "rzp_test_xxxxx",
  razorpayKeySecret: "••••••••••••",
  acceptOnlinePayment: true,
  acceptOfflinePayment: true,
  gstEnabled: true,
  gstPercentage: 18,
};

const contactSettings = {
  email: "sports@hanumatfest.com",
  phone: "+91 98765 43210",
  alternatePhone: "+91 98765 43211",
  address: "Hanumat Sports Complex, Sector 15, Delhi - 110085",
  facebookUrl: "https://facebook.com/hanumatfest",
  instagramUrl: "https://instagram.com/hanumatfest",
  twitterUrl: "https://twitter.com/hanumatfest",
};

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Settings</h1>
          <p className="text-muted-foreground">
            Configure your event and application settings
          </p>
        </div>
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="event" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
          <TabsTrigger value="event">
            <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
            Event
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2 hidden sm:inline" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="h-4 w-4 mr-2 hidden sm:inline" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2 hidden sm:inline" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Event Settings */}
        <TabsContent value="event">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Event Information
                </CardTitle>
                <CardDescription>
                  Basic event details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Event Name</label>
                    <input
                      type="text"
                      defaultValue={eventSettings.name}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tagline</label>
                    <input
                      type="text"
                      defaultValue={eventSettings.tagline}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Event Dates</label>
                    <input
                      type="text"
                      defaultValue={eventSettings.dates}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Venue</label>
                    <input
                      type="text"
                      defaultValue={eventSettings.venue}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Settings</CardTitle>
                <CardDescription>
                  Control registration availability and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Registration Status</p>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable new registrations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={eventSettings.registrationOpen}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration Deadline</label>
                    <input
                      type="date"
                      defaultValue="2024-02-10"
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Participants</label>
                    <input
                      type="number"
                      defaultValue={eventSettings.maxParticipants}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Capacity</span>
                    <span className="text-sm">
                      {eventSettings.currentParticipants} / {eventSettings.maxParticipants}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(eventSettings.currentParticipants / eventSettings.maxParticipants) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Razorpay Configuration
                </CardTitle>
                <CardDescription>
                  Configure your payment gateway credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Razorpay Integration
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Get your API keys from the{" "}
                        <a
                          href="https://dashboard.razorpay.com"
                          target="_blank"
                          className="underline inline-flex items-center gap-1"
                        >
                          Razorpay Dashboard
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={paymentSettings.razorpayKeyId}
                      className="flex-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(paymentSettings.razorpayKeyId, "keyId")}
                    >
                      {copied === "keyId" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Secret</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      defaultValue={paymentSettings.razorpayKeySecret}
                      className="flex-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <Button variant="outline" size="icon">
                      <Shield className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>
                  Configure payment methods and taxes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Online Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via Razorpay
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={paymentSettings.acceptOnlinePayment}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Offline Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Accept cash/check payments (requires manual verification)
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={paymentSettings.acceptOfflinePayment}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">GST</p>
                    <p className="text-sm text-muted-foreground">
                      Apply GST on all payments
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={paymentSettings.gstPercentage}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={paymentSettings.gstEnabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Displayed on the contact page and in emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={contactSettings.email}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Primary Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue={contactSettings.phone}
                      className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue={contactSettings.alternatePhone}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={contactSettings.address}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Links to your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Facebook</label>
                  <input
                    type="url"
                    defaultValue={contactSettings.facebookUrl}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <input
                    type="url"
                    defaultValue={contactSettings.instagramUrl}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter / X</label>
                  <input
                    type="url"
                    defaultValue={contactSettings.twitterUrl}
                    placeholder="https://twitter.com/..."
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Configure when to send automated emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Registration Confirmation",
                    description: "Send email when registration is created",
                    defaultChecked: true,
                  },
                  {
                    title: "Payment Confirmation",
                    description: "Send email when payment is successful",
                    defaultChecked: true,
                  },
                  {
                    title: "Registration Approved",
                    description: "Send email when registration is confirmed",
                    defaultChecked: true,
                  },
                  {
                    title: "Registration Waitlisted",
                    description: "Send email when added to waitlist",
                    defaultChecked: true,
                  },
                  {
                    title: "Registration Cancelled",
                    description: "Send email when registration is cancelled",
                    defaultChecked: false,
                  },
                  {
                    title: "Event Reminders",
                    description: "Send reminder emails before event",
                    defaultChecked: true,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.defaultChecked}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Notifications</CardTitle>
                <CardDescription>
                  Notifications sent to administrators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "New Registration",
                    description: "Notify when a new registration is created",
                    defaultChecked: true,
                  },
                  {
                    title: "Payment Received",
                    description: "Notify when a payment is received",
                    defaultChecked: true,
                  },
                  {
                    title: "Sport Full",
                    description: "Notify when a sport reaches capacity",
                    defaultChecked: true,
                  },
                  {
                    title: "Daily Summary",
                    description: "Send daily registration summary",
                    defaultChecked: false,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.defaultChecked}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
