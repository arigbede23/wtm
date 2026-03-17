// useEventFilters — reads and writes event filters from URL search params.
// This keeps filter state shareable, bookmarkable, and survives page refresh.

"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { EventCategory, EventFilters } from "@/types";

export function useEventFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current URL params into an EventFilters object
  const filters: EventFilters = useMemo(() => {
    const f: EventFilters = {};
    const category = searchParams.get("category");
    if (category) f.category = category as EventCategory;
    const search = searchParams.get("search");
    if (search) f.search = search;
    const lat = searchParams.get("lat");
    if (lat) f.lat = parseFloat(lat);
    const lng = searchParams.get("lng");
    if (lng) f.lng = parseFloat(lng);
    const radius = searchParams.get("radius");
    if (radius) f.radius = parseFloat(radius);
    const isFree = searchParams.get("isFree");
    if (isFree === "true") f.isFree = true;
    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) f.dateFrom = dateFrom;
    const dateTo = searchParams.get("dateTo");
    if (dateTo) f.dateTo = dateTo;
    const datePreset = searchParams.get("datePreset");
    if (datePreset) f.datePreset = datePreset;
    return f;
  }, [searchParams]);

  // Update URL params with new filter values (merges with existing)
  const setFilters = useCallback(
    (updates: Partial<EventFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilters, clearFilters };
}
