// Map Page — interactive Leaflet map showing events as markers.
// Dynamically imports EventMap with { ssr: false } since Leaflet needs the browser.

"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, eventsQueryKey } from "@/lib/fetchEvents";
import { CategoryFilter } from "@/components/events/CategoryFilter";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocalSync } from "@/hooks/useLocalSync";
import { MapPin } from "lucide-react";
import type { EventFilters } from "@/types";

// Dynamic import with SSR disabled — Leaflet needs the DOM
const EventMap = dynamic(() => import("@/components/map/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-neutral-900">
      <div className="animate-pulse text-gray-400">Loading map...</div>
    </div>
  ),
});

function MapContent() {
  const { filters, setFilters } = useEventFilters();
  const { lat, lng, error: geoError, requestLocation } = useGeolocation();

  // Sync Ticketmaster events near user (runs once per area per 30 min)
  useLocalSync(lat, lng);

  // 100 mi radius from user's current location
  const apiFilters: EventFilters = {
    ...filters,
    ...(lat != null && lng != null
      ? { lat, lng, radius: 100 }
      : {}),
  };

  const { data: events = [] } = useQuery({
    queryKey: eventsQueryKey(apiFilters),
    queryFn: () => fetchEvents(apiFilters),
  });

  return (
    <div className="relative flex h-[calc(100dvh-120px)] flex-col -mb-20">
      {/* Location permission banner */}
      {lat == null && lng == null && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {geoError
              ? "Location access was denied. Please allow it in your browser settings, or tap below to try again."
              : "Location access needed to show nearby events."}
          </span>
          <button
            onClick={requestLocation}
            className="shrink-0 rounded-full bg-amber-200 px-3 py-0.5 text-xs font-medium text-amber-900 hover:bg-amber-300 dark:bg-amber-800 dark:text-amber-100 dark:hover:bg-amber-700"
          >
            {geoError ? "Try again" : "Allow"}
          </button>
        </div>
      )}

      {/* Category filter overlay */}
      <div className="absolute left-0 right-0 top-0 z-[1000] bg-white/80 backdrop-blur-sm dark:bg-black/80">
        <CategoryFilter
          selected={filters.category ?? "ALL"}
          onChange={(cat) =>
            setFilters({ category: cat === "ALL" ? undefined : (cat as any) })
          }
        />
      </div>

      {/* Map fills remaining space */}
      <div className="flex-1 pt-12">
        <EventMap events={events} userLat={lat} userLng={lng} />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-120px)] items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading map...</div>
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
