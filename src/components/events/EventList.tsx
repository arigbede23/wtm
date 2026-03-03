// EventList — fetches events from the API and displays them as a scrollable list of cards.
// Uses TanStack Query (useQuery) to handle loading, caching, and error states automatically.

"use client";

import { useQuery } from "@tanstack/react-query";
import { EventCard } from "./EventCard";
import type { EventWithCounts } from "@/types";

// Fetch events from our API route
async function fetchEvents(): Promise<EventWithCounts[]> {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export function EventList() {
  // useQuery handles fetching, caching, loading states, and errors for us.
  // "events" is the cache key — TanStack Query uses it to store and retrieve data.
  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  // Loading state — show animated skeleton placeholders
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {/* Create 3 skeleton cards using Array spread trick */}
        {[...Array(3)].map((_, i) => (
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

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Could not load events. Please try again.
        </p>
      </div>
    );
  }

  // Empty state — no events found
  if (!events?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          No events yet
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Check back soon or create the first event!
        </p>
      </div>
    );
  }

  // Success — render the list of event cards
  return (
    <div className="space-y-4 p-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
