// MessageBadge — message icon with unread count badge.
// Placed in the Header next to NotificationBell. Links to /messages.

"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function MessageBadge() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetch("/api/conversations/unread")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setUnreadCount(data.count);
        }
      })
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  return (
    <Link
      href="/messages"
      className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:text-white"
    >
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
