// EventCard — displays a single event as a card in the feed.
// Shows the cover image, category badge, price, title, date, and location.
// The whole card is a link to the event detail page.

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { cn, formatDate, formatTime, formatPrice } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventWithCounts } from "@/types";

export function EventCard({
  event,
}: {
  event: EventWithCounts & { distance?: number };
}) {
  return (
    <Link href={`/event/${event.id}`} className="block">
      <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
        {/* Cover Image */}
        <div className="relative aspect-[2/1] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {event.coverImageUrl ? (
            // "group-hover:scale-105" zooms the image slightly on hover
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            // Fallback: show the category emoji if there's no image
            <div className="flex h-full items-center justify-center text-4xl">
              {CATEGORY_EMOJI[event.category]}
            </div>
          )}

          {/* Price badge — top right corner */}
          <div
            className={cn(
              "absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
              event.isFree
                ? "bg-green-100 text-green-800"
                : "bg-white/90 text-gray-900 backdrop-blur-sm"
            )}
          >
            {formatPrice(event.price, event.isFree)}
          </div>

          {/* Category badge — top left corner */}
          <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {CATEGORY_EMOJI[event.category]} {event.category.toLowerCase()}
          </div>
        </div>

        {/* Card body — text content below the image */}
        <div className="p-4">
          <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-gray-100">
            {event.title}
          </h3>

          {/* Date and time */}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(event.startDate)} &middot;{" "}
              {formatTime(event.startDate)}
            </span>
          </div>

          {/* Location */}
          {event.address && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">
                {event.address}
                {event.city ? `, ${event.city}` : ""}
              </span>
            </div>
          )}

          {/* Distance — shown when user location is available */}
          {event.distance != null && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-brand-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.distance} mi away</span>
            </div>
          )}

          {/* RSVP count */}
          {event._count.rsvps > 0 && (
            <p className="mt-2 text-xs text-brand-600 font-medium">
              {event._count.rsvps} {event._count.rsvps === 1 ? "person" : "people"} going
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
