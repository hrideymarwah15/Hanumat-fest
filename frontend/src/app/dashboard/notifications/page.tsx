"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy,
  CreditCard,
  Calendar,
  Clock,
  Check,
  Trash2,
  Settings,
} from "lucide-react";

// Mock notifications data
const notifications = [
  {
    id: 1,
    title: "Payment Reminder",
    message:
      "Complete payment for Football registration before March 10 to secure your spot.",
    time: "2 hours ago",
    type: "warning",
    read: false,
    icon: CreditCard,
  },
  {
    id: 2,
    title: "Registration Confirmed",
    message:
      "Your Cricket registration has been confirmed. Team Thunder Bolts is ready to compete!",
    time: "1 day ago",
    type: "success",
    read: false,
    icon: CheckCircle,
  },
  {
    id: 3,
    title: "Schedule Update",
    message:
      "Cricket matches have been rescheduled to March 16 due to venue availability.",
    time: "2 days ago",
    type: "info",
    read: false,
    icon: Calendar,
  },
  {
    id: 4,
    title: "Team Member Added",
    message: "Sarah Wilson has been added to your Football team - Goal Getters.",
    time: "3 days ago",
    type: "info",
    read: true,
    icon: Trophy,
  },
  {
    id: 5,
    title: "Early Bird Ending Soon",
    message:
      "Early bird pricing for Basketball ends in 3 days. Register now to save ₹50!",
    time: "4 days ago",
    type: "warning",
    read: true,
    icon: Clock,
  },
  {
    id: 6,
    title: "Welcome to HanumatFest!",
    message:
      "Thank you for creating an account. Start by browsing available sports.",
    time: "1 week ago",
    type: "info",
    read: true,
    icon: Info,
  },
];

type NotificationType = "all" | "unread" | "warning" | "success" | "info";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationType>("all");
  const [notifs, setNotifs] = useState(notifications);

  const filteredNotifications = notifs.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifs(
      notifs.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifs(notifs.filter((n) => n.id !== id));
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-600 dark:text-yellow-400",
          border: "border-yellow-200 dark:border-yellow-800",
        };
      case "success":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          border: "border-green-200 dark:border-green-800",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your registrations and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Unread Count */}
      {unreadCount > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              You have {unreadCount} unread notification
              {unreadCount > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              Click on a notification to mark it as read
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(
          [
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "warning", label: "Alerts" },
            { value: "success", label: "Success" },
            { value: "info", label: "Info" },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === item.value
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {item.label}
            {item.value === "unread" && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            {filter !== "all"
              ? "No notifications match your filter"
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const styles = getTypeStyles(notif.type);
            const Icon = notif.icon;

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`group relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  !notif.read
                    ? `${styles.bg} ${styles.border}`
                    : "bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      !notif.read ? styles.bg : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        !notif.read ? styles.text : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`font-medium ${
                          !notif.read ? "" : "text-muted-foreground"
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        !notif.read
                          ? "text-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.time}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
