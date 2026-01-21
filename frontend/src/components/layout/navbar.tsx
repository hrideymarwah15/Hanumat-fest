"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Trophy,
} from "lucide-react";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar_url?: string | null;
    role?: string;
  } | null;
  unreadCount?: number;
}

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/sports", label: "Sports" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ user, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "coordinator";

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="glass-card rounded-2xl px-4 lg:px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-500 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl hidden sm:block">
            <span className="text-primary">Hanumat</span>
            <span className="text-foreground">Fest</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/dashboard/notifications"
                className="relative p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.avatar_url}
                    size="sm"
                  />
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-lg z-50 py-1 animate-scale-in">
                      <div className="px-4 py-3 border-b">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t py-1">
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full cursor-pointer"
                          onClick={() => {
                            // Handle logout
                            setProfileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="p-2 rounded-lg hover:bg-accent md:hidden cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-card rounded-xl p-4 max-w-7xl mx-auto animate-slide-up">
          <div className="flex flex-col gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/signup"
                className="px-4 py-3 mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full">Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
