// FriendsFeed — event list for the "Friends" tab with "X is going" annotations.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { EventCard } from "@/components/events/EventCard";
import { UserAvatar } from "./UserAvatar";
import type { EventWithCounts } from "@/types";
import Link from "next/link";
import { Users } from "lucide-react";

type FriendEvent = EventWithCounts & {
  friendsGoing: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  }[];
};

export function FriendsFeed() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<FriendEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/feed/friends")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="h-12 w-12 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">
          Sign in to see what your friends are attending
        </p>
        <Link
          href="/login"
          className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="h-12 w-12 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          No events from friends yet
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Follow people to see the events they&apos;re attending
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {events.map((event) => (
        <div key={event.id}>
          {/* Friends going annotation */}
          {event.friendsGoing.length > 0 && (
            <div className="mb-2 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {event.friendsGoing.slice(0, 3).map((friend) => (
                  <UserAvatar
                    key={friend.id}
                    src={friend.avatarUrl}
                    name={friend.displayName ?? friend.username}
                    size="sm"
                    className="ring-2 ring-white dark:ring-gray-950"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {friendsGoingText(event.friendsGoing)}
              </p>
            </div>
          )}
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}

function friendsGoingText(
  friends: { displayName: string | null; username: string | null }[]
): string {
  const names = friends.map(
    (f) => f.displayName ?? f.username ?? "Someone"
  );
  if (names.length === 1) return `${names[0]} is going`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are going`;
  return `${names[0]} and ${names.length - 1} others are going`;
}
