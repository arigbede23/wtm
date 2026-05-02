// EventList — fetches events from the API and displays them as a scrollable list of cards.
// Uses TanStack Query with shared fetch helper so Feed and Map share the same cache.

"use client";

import { useQuery } from "@tanstack/react-query";
import { EventCard } from "./EventCard";
import { fetchEvents, eventsQueryKey } from "@/lib/fetchEvents";
import type { EventFilters } from "@/types";

// User-applied filters (excludes lat/lng/radius which are derived from geolocation, not user choice)
function hasActiveFilters(f: EventFilters) {
  return Boolean(f.category || f.search || f.isFree || f.dateFrom || f.dateTo || f.datePreset);
}

export function EventList({
  filters = {},
  onClearFilters,
}: {
  filters?: EventFilters;
  onClearFilters?: () => void;
}) {
  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: eventsQueryKey(filters),
    queryFn: () => fetchEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 min — avoid re-fetching on minor state changes
  });

  // Loading state — show animated skeleton placeholders
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-100 dark:border-neutral-800"
          >
            <div className="aspect-[2/1] rounded-t-2xl bg-gray-200 dark:bg-neutral-800" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
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
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Could not load events. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state — branch on whether filters are restricting the result
  if (!events?.length) {
    const filtered = hasActiveFilters(filters);
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-4xl">{filtered ? "🔍" : "🎉"}</p>
        <p className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
          {filtered ? "No events match your filters" : "No events nearby"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {filtered
            ? "Try widening your search or clearing filters."
            : "We'll have something for you soon — check back later."}
        </p>
        {filtered && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Clear filters
          </button>
        )}
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
