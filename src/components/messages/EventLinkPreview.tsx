// EventLinkPreview — compact inline card shown when a message contains an event link.
// Fetches event preview data and renders a clickable card with cover image, title, date, and location.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { formatEventDateTime } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { EventCategory } from "@/types";

type EventPreview = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  startDate: string;
  category: EventCategory;
  address: string | null;
  city: string | null;
  state: string | null;
  isFree: boolean;
  price: number | null;
};

export function EventLinkPreview({ eventId, isSent }: { eventId: string; isSent: boolean }) {
  const [event, setEvent] = useState<EventPreview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${eventId}/preview`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, [eventId]);

  if (error || !event) return null;

  const location = [event.address, event.city, event.state].filter(Boolean).join(", ");

  return (
    <Link href={`/event/${event.id}`} className="block">
      <div className={`mt-1.5 overflow-hidden rounded-xl border ${
        isSent
          ? "border-white/20 bg-white/10"
          : "border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
      }`}>
        {/* Cover image */}
        {event.coverImageUrl ? (
          <div className="relative aspect-[2/1] overflow-hidden">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className={`flex aspect-[3/1] items-center justify-center ${
            isSent ? "bg-white/5" : "bg-gray-100 dark:bg-neutral-700"
          }`}>
            <CategoryIcon category={event.category} className={`h-8 w-8 ${
              isSent ? "text-white/40" : "text-gray-300 dark:text-neutral-500"
            }`} />
          </div>
        )}

        {/* Event info */}
        <div className="px-3 py-2.5">
          <p className={`text-sm font-semibold leading-tight ${
            isSent ? "text-white" : "text-gray-900 dark:text-white"
          }`}>
            {event.title}
          </p>

          <div className={`mt-1 flex items-center gap-1 text-xs ${
            isSent ? "text-white/70" : "text-gray-500 dark:text-neutral-400"
          }`}>
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatEventDateTime(event.startDate)}</span>
          </div>

          {location && (
            <div className={`mt-0.5 flex items-center gap-1 text-xs ${
              isSent ? "text-white/70" : "text-gray-500 dark:text-neutral-400"
            }`}>
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
