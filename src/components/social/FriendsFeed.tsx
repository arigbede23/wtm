// FriendsFeed — event list for the "Friends" tab with "X is going" annotations.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { EventCard } from "@/components/events/EventCard";
import { UserAvatar } from "./UserAvatar";
import { friendsGoingText } from "@/lib/utils";
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

export function FriendsFeed({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<FriendEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (lat != null && lng != null) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
      params.set("radius", "50");
    }
    fetch(`/api/feed/friends?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, lat, lng]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
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
        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
          No events from friends yet
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Follow people to see the events they&apos;re attending
        </p>
        <Link
          href="/people"
          className="mt-4 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Find People
        </Link>
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
                    className="ring-2 ring-white dark:ring-black"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-400">
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

