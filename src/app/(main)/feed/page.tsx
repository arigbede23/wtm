// Feed Page — main screen with category filters, toggle pills, and event list.
// Uses URL search params for filter state so filters are shareable and bookmarkable.

"use client";

import { Suspense, useState } from "react";
import { MapPin } from "lucide-react";
import { EventList } from "@/components/events/EventList";
import { CategoryFilter } from "@/components/events/CategoryFilter";
import { FilterBar } from "@/components/events/FilterBar";
import { FriendsFeed } from "@/components/social/FriendsFeed";
import { ForYouFeed } from "@/components/recommendations/ForYouFeed";
import { useEventFilters } from "@/hooks/useEventFilters";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocalSync } from "@/hooks/useLocalSync";
import { useLocalTeamContext } from "@/components/layout/LocalTeamProvider";
import { getTeamLogoUrl } from "@/lib/localTeams";
import { StoryBar } from "@/components/stories/StoryBar";
import type { EventFilters } from "@/types";

type FeedTab = "discover" | "foryou" | "friends";

function FeedContent() {
  const [tab, setTab] = useState<FeedTab>("discover");
  const { filters, setFilters } = useEventFilters();
  const { lat, lng, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const team = useLocalTeamContext();

  const hasLocation = lat != null && lng != null;

  // Sync Ticketmaster events near the user's location (runs once per area per 30 min)
  useLocalSync(lat, lng);

  // Merge URL filters with user location + 150 mi radius for API call
  const apiFilters: EventFilters = {
    ...filters,
    ...(hasLocation ? { lat, lng, radius: 150 } : {}),
  };

  return (
    <div>
      {/* Stories + heading section */}
      <div className="pt-3">
        <StoryBar />
        <div className="mt-1 border-b border-gray-100 dark:border-neutral-800" />
      </div>

      {/* Page heading with team badge */}
      <div className="flex items-center gap-3 px-4 pt-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Happening near you
          </h2>
          <p className="text-sm text-gray-500">
            Events and things to do this week
          </p>
        </div>
        {team && (
          <img
            src={getTeamLogoUrl(team)}
            alt={`${team.city} ${team.team}`}
            className="h-12 w-12 object-contain opacity-80"
          />
        )}
      </div>

      {/* Discover / For You / Friends pill toggle */}
      <div className="mx-4 mt-3 flex gap-1 rounded-full bg-gray-100 p-1 dark:bg-neutral-800">
        <button
          onClick={() => setTab("discover")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            tab === "discover"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => setTab("foryou")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            tab === "foryou"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setTab("friends")}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            tab === "friends"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          Friends
        </button>
      </div>

      {tab === "discover" && (
        <>
          {/* Location permission banner */}
          {!hasLocation && !geoLoading && (
            <div className="mx-4 mt-3 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-brand-100 p-2 dark:bg-brand-900">
                  <MapPin className="h-5 w-5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Enable location to see events near you
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                    {geoError
                      ? "Location access was denied. Please allow it in your browser settings, or tap below to try again."
                      : "We\u2019ll show events near your current location."}
                  </p>
                  <button
                    onClick={requestLocation}
                    className="mt-2.5 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    Allow location access
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state while getting location */}
          {geoLoading && (
            <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              Getting your location...
            </div>
          )}

          {/* Category filter pills */}
          <CategoryFilter
            selected={filters.category ?? "ALL"}
            onChange={(cat) =>
              setFilters({ category: cat === "ALL" ? undefined : (cat as any) })
            }
          />

          {/* Filter toggles: Free, This week */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
          />

          {/* Event list — only fetch once we have location so we don't show
              irrelevant events from other cities */}
          {hasLocation ? (
            <EventList filters={apiFilters} />
          ) : !geoLoading ? (
            <div className="px-4 pt-6 text-center text-sm text-gray-400 dark:text-neutral-400">
              Grant location access above to discover events near you
            </div>
          ) : null}
        </>
      )}

      {tab === "foryou" && <ForYouFeed lat={lat} lng={lng} />}

      {tab === "friends" && <FriendsFeed lat={lat} lng={lng} />}
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
      }
    >
      <FeedContent />
    </Suspense>
  );
}
