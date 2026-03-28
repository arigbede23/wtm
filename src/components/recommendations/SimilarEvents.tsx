// SimilarEvents — "You might also like" section on event detail pages.
// Fetches similar events from the API and renders as a horizontal scroll of cards.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatDate, formatTime, formatPrice } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventWithCounts, type EventCategory } from "@/types";
import { parseMatchup } from "@/lib/sportsTeams";

export function SimilarEvents({ eventId }: { eventId: string }) {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}/similar`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          You might also like
        </h2>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-48 flex-shrink-0 animate-pulse rounded-xl border border-gray-100 dark:border-neutral-800"
            >
              <div className="aspect-[3/2] rounded-t-xl bg-gray-200 dark:bg-neutral-800" />
              <div className="space-y-2 p-3">
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-neutral-800" />
                <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
        You might also like
      </h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {events.map((event) => {
          const matchup = event.category === "SPORTS" ? parseMatchup(event.title) : null;
          return (
          <Link
            key={event.id}
            href={`/event/${event.id}`}
            className="w-48 flex-shrink-0"
          >
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
              <div className="relative aspect-[3/2] overflow-hidden bg-gray-100 dark:bg-neutral-800">
                {matchup && (matchup.home || matchup.away) ? (
                  <div
                    className="flex h-full items-center justify-center gap-4"
                    style={{ background: `linear-gradient(to right, ${matchup.home?.color ?? "#333"} 50%, ${matchup.away?.color ?? "#333"} 50%)` }}
                  >
                    {matchup.home ? (
                      <img src={matchup.home.logo} alt={matchup.home.name} className="h-14 w-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                    ) : <div className="h-14 w-14" />}
                    {matchup.away ? (
                      <img src={matchup.away.logo} alt={matchup.away.name} className="h-14 w-14 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                    ) : <div className="h-14 w-14" />}
                  </div>
                ) : event.coverImageUrl ? (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">
                    {CATEGORY_EMOJI[event.category as EventCategory]}
                  </div>
                )}
                <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  {formatPrice(event.price, event.isFree)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
