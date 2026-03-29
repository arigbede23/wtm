// Shared event fetching utilities — used by both Feed and Map pages.
// Centralizes API calls and TanStack Query cache keys so both views share the same data.

import type { EventFilters, EventWithCounts } from "@/types";

// Convert EventFilters to URL query string params
export function buildEventQueryString(filters: EventFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.lat != null) params.set("lat", String(filters.lat));
  if (filters.lng != null) params.set("lng", String(filters.lng));
  if (filters.radius != null) params.set("radius", String(filters.radius));
  if (filters.isFree) params.set("isFree", "true");
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Fetch events from API with optional filters
export async function fetchEvents(
  filters: EventFilters = {}
): Promise<(EventWithCounts & { distance?: number })[]> {
  const res = await fetch(`/api/events${buildEventQueryString(filters)}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

// TanStack Query key factory — ensures both Feed and Map use the same cache
// when filters are identical. Rounds lat/lng to avoid cache misses from GPS jitter.
export function eventsQueryKey(filters: EventFilters = {}) {
  const stable = { ...filters };
  if (stable.lat != null) stable.lat = Math.round(stable.lat * 100) / 100;
  if (stable.lng != null) stable.lng = Math.round(stable.lng * 100) / 100;
  return ["events", stable] as const;
}
