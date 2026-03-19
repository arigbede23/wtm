// ForYouFeed — event list for the "For You" tab.
// Shows personalized recommendations, category fallback, or prompts to set interests.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { EventCard } from "@/components/events/EventCard";
import type { EventWithCounts } from "@/types";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function ForYouFeed({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [strategy, setStrategy] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
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
    fetch(`/api/feed/for-you?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
        setStrategy(data.strategy ?? data.error ?? "");
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, lat, lng]);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <div className="aspect-[2/1] rounded-t-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="h-12 w-12 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">
          Sign in to get personalized event recommendations
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

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // No interests set — prompt to onboard
  if (strategy === "none") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="h-12 w-12 text-brand-300" />
        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          Tell us what you like
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Set your interests to get personalized recommendations
        </p>
        <Link
          href="/onboarding"
          className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Set Interests
        </Link>
      </div>
    );
  }

  // No events found
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          No recommendations yet
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Check back soon — we&apos;re finding events for you!
        </p>
      </div>
    );
  }

  // Success — render recommended events
  return (
    <div className="space-y-4 p-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
