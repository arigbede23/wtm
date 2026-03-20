// Notifications Page — lists all notifications, marks all as read on mount.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationItemRow } from "@/components/social/NotificationItem";
import { Bell } from "lucide-react";
import Link from "next/link";
import type { NotificationItem } from "@/types";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
          // Mark all as read (fire-and-forget)
          if (data.some((n: NotificationItem) => !n.read)) {
            fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "markRead" }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Bell className="h-12 w-12 text-gray-300" />
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to see your notifications
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        Notifications
      </h2>

      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl p-3"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                <div className="h-2 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            No notifications yet
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-1">
          {notifications.map((notification) => (
            <NotificationItemRow
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
