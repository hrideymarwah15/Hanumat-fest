"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  CreditCard,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Registrations",
    href: "/dashboard/registrations",
    icon: Trophy,
    badge: 3,
  },
  {
    title: "My Teams",
    href: "/dashboard/teams",
    icon: Users,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    badge: 5,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// Mock user data
const currentUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: null,
  college: "XYZ Engineering College",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">HanumatFest</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={currentUser.avatar || undefined} />
              <AvatarFallback>
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.college}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge
                  variant={isActive(item.href) ? "secondary" : "default"}
                  className={
                    isActive(item.href)
                      ? "bg-white/20 text-white"
                      : "bg-primary text-white"
                  }
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button variant="outline" className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
          <div className="h-full flex items-center justify-between px-4 lg:px-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              {pathname !== "/dashboard" && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">
                    {pathname.split("/").pop()?.replace("-", " ")}
                  </span>
                </>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    5
                  </span>
                </Button>
              </Link>

              {/* Profile Menu */}
              <Link href="/dashboard/profile">
                <Avatar className="cursor-pointer">
                  <AvatarImage src={currentUser.avatar || undefined} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
