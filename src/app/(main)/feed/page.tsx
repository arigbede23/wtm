// Feed Page — main screen with category filters, toggle pills, and event list.
// Uses URL search params for filter state so filters are shareable and bookmarkable.

"use client";

import { Suspense } from "react";
import { EventList } from "@/components/events/EventList";
import { CategoryFilter } from "@/components/events/CategoryFilter";
import { FilterBar } from "@/components/events/FilterBar";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { EventFilters } from "@/types";

function FeedContent() {
  const { filters, setFilters } = useEventFilters();
  const { lat, lng } = useGeolocation();

  // Merge URL filters with user location for API call
  const apiFilters: EventFilters = {
    ...filters,
    ...(lat != null && lng != null ? { lat, lng } : {}),
  };

  return (
    <div>
      {/* Page heading */}
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Happening near you
        </h2>
        <p className="text-sm text-gray-500">
          Events and things to do this week
        </p>
      </div>

      {/* Category filter pills */}
      <CategoryFilter
        selected={filters.category ?? "ALL"}
        onChange={(cat) =>
          setFilters({ category: cat === "ALL" ? undefined : (cat as any) })
        }
      />

      {/* Filter toggles: Free, This week, Distance */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        hasLocation={lat != null && lng != null}
      />

      {/* Event list — uses shared fetch helper with filters */}
      <EventList filters={apiFilters} />
    </div>
  );
}

// Wrap in Suspense boundary (required by useSearchParams)
export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
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
      }
    >
      <FeedContent />
    </Suspense>
  );
}
