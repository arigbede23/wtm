// Event Detail Page — shows full details for a single event.
// This is a Server Component (no "use client") so data is fetched on the server.
// The [id] folder name is a dynamic route — /event/abc123 passes "abc123" as params.id.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

// Always fetch fresh data (don't use a cached/static version)
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  MapPin,
  Navigation,
  DollarSign,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { formatDate, formatTime, formatPrice, isTimeMidnight, buildCalendarUrl, buildDirectionsUrl } from "@/lib/utils";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";
import RsvpButtons from "@/components/events/RsvpButtons";
import SaveButton from "@/components/events/SaveButton";
import { ShareButton } from "@/components/social/ShareButton";
import { AttendeeList } from "@/components/social/AttendeeList";
import { SimilarEvents } from "@/components/recommendations/SimilarEvents";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string }; // id comes from the [id] folder name in the URL
}) {
  // Create the Supabase client inside the function (not at module level)
  // so it only runs at request time, not during the build step.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch the event by ID, including RSVP count
  const { data: event, error } = await supabase
    .from("events")
    .select("*, rsvps(count)")
    .eq("id", params.id)
    .single(); // .single() returns one object instead of an array

  // If the event doesn't exist, show the 404 page
  if (error || !event) {
    notFound();
  }

  const rsvpCount = event.rsvps?.[0]?.count ?? 0;
  const category = event.category as EventCategory;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white dark:bg-gray-950">
      {/* Hero Image Section */}
      <div className="relative">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          // Fallback if no image — show category emoji
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 text-6xl dark:bg-gray-800">
            {CATEGORY_EMOJI[category]}
          </div>
        )}

        {/* Back button — overlaid on top of the image */}
        <Link
          href="/feed"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Share and Bookmark buttons — top right corner */}
        <div className="absolute right-4 top-4 flex gap-2">
          <ShareButton title={event.title} />
          <SaveButton eventId={event.id} />
        </div>
      </div>

      {/* Event Details Section */}
      <div className="p-4">
        {/* Category pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {CATEGORY_EMOJI[category]} {category.toLowerCase()}
        </div>

        {/* Event title */}
        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {event.title}
        </h1>

        {/* Date, location, and price details */}
        <div className="mt-4 space-y-3">
          {/* Date and time */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(event.startDate)}
              </p>
              {!isTimeMidnight(event.startDate) && (
                <p className="text-sm text-gray-500">
                  {formatTime(event.startDate)}
                  {event.endDate && !isTimeMidnight(event.endDate) && ` – ${formatTime(event.endDate)}`}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {event.address}
                </p>
                {event.city && (
                  <p className="text-sm text-gray-500">
                    {event.city}
                    {event.state ? `, ${event.state}` : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-start gap-3">
            <DollarSign className="mt-0.5 h-5 w-5 text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formatPrice(event.price, event.isFree)}
            </p>
          </div>
        </div>

        {/* Add to Calendar & Get Directions */}
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={buildCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <CalendarPlus className="h-4 w-4" />
            Add to Calendar
          </a>
          {(() => {
            const directionsUrl = buildDirectionsUrl(event);
            return directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            ) : null;
          })()}
        </div>

        {/* About / Description */}
        {event.description && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              About
            </h2>
            <p className="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">
              {event.description}
            </p>
          </div>
        )}

        {/* Attendee list — who's going */}
        <AttendeeList eventId={event.id} rsvpCount={rsvpCount} />

        {/* RSVP Buttons — client component handles auth state and API calls */}
        <RsvpButtons eventId={event.id} initialRsvpCount={rsvpCount} />

        {/* Similar Events — AI-powered recommendations */}
        <SimilarEvents eventId={event.id} />
      </div>
    </div>
  );
}
