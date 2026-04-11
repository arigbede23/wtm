// Event Detail Page — shows full details for a single event.
// This is a Server Component (no "use client") so data is fetched on the server.
// The [id] folder name is a dynamic route — /event/abc123 passes "abc123" as params.id.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

import type { Metadata } from "next";

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
  ExternalLink,
  Ticket,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { formatPrice, isEventPast, buildCalendarUrl, buildDirectionsUrl } from "@/lib/utils";
import { EventDateTime } from "@/components/events/EventDateTime";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import RsvpButtons from "@/components/events/RsvpButtons";
import SaveButton from "@/components/events/SaveButton";
import { EventActions } from "@/components/events/EventActions";
import { Comments } from "@/components/events/Comments";
import { ShareButton } from "@/components/social/ShareButton";
import { AttendeeList } from "@/components/social/AttendeeList";
import { UserAvatar } from "@/components/social/UserAvatar";
import { SimilarEvents } from "@/components/recommendations/SimilarEvents";
import { InviteFriendsButton } from "@/components/events/InviteFriendsButton";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { parseMatchup, findTeamInTitle } from "@/lib/sportsTeams";


// Generate dynamic Open Graph metadata so shared links show a branded card image.
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: event } = await supabase
    .from("events")
    .select("title, description, category, startDate, city, state")
    .eq("id", params.id)
    .single();

  if (!event) {
    return { title: "Event Not Found" };
  }

  const category = event.category as EventCategory;
  const location = [event.city, event.state].filter(Boolean).join(", ");
  const description =
    event.description?.slice(0, 160) ??
    `${CATEGORY_EMOJI[category]} ${category.charAt(0) + category.slice(1).toLowerCase()} event${location ? ` in ${location}` : ""}`;

  // Next.js resolves relative URLs against metadataBase (auto-detected on Vercel).
  // Use NEXT_PUBLIC_APP_URL if set, otherwise fall back to VERCEL_URL, then localhost.
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const ogImageUrl = `${baseUrl}/api/events/${params.id}/og`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: [ogImageUrl],
    },
  };
}

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

  // Fetch the event by ID, including RSVP count.
  // Note: organizer join is separate to avoid RLS issues with the users table.
  let { data: event, error } = await supabase
    .from("events")
    .select("*, rsvps(count)")
    .eq("id", params.id)
    .single();

  // If the first attempt failed (timeout, network blip), retry once.
  // This prevents intermittent "page not found" errors on slow connections.
  if (error && !event) {
    const retry = await supabase
      .from("events")
      .select("*, rsvps(count)")
      .eq("id", params.id)
      .single();
    event = retry.data;
  }

  // If the event truly doesn't exist, show the 404 page
  if (!event) {
    notFound();
  }

  // Fetch organizer info separately (may fail if user is anonymous — that's OK)
  let organizer: { id: string; displayName: string | null; username: string | null; avatarUrl: string | null } | null = null;
  if (event.organizerId) {
    const { data } = await supabase
      .from("users")
      .select("id, displayName, username, avatarUrl")
      .eq("id", event.organizerId)
      .single();
    organizer = data;
  }

  const rsvpCount = event.rsvps?.[0]?.count ?? 0;
  const category = event.category as EventCategory;
  const past = isEventPast(event.startDate, event.endDate);
  const isExternal = !!event.source && event.source !== "USER";
  const isGenericImage = !event.coverImageUrl || event.coverImageUrl.includes("/dam/c/");
  const matchup = category === "SPORTS" ? parseMatchup(event.title) : null;
  const singleTeam = !matchup && isGenericImage ? findTeamInTitle(event.title) : null;

  return (
    <MobileContainer>
      {/* Hero Image Section */}
      <div className="relative">
        {matchup && (matchup.home || matchup.away) ? (
          <div
            className="flex aspect-[16/9] w-full items-center justify-center gap-10"
            style={{
              background: `linear-gradient(to right, ${matchup.home?.color ?? "#333"} 50%, ${matchup.away?.color ?? "#333"} 50%)`,
            }}
          >
            {matchup.home ? (
              <img src={matchup.home.logo} alt={matchup.home.name} className="h-32 w-32 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
            ) : (
              <div className="h-32 w-32" />
            )}
            {matchup.away ? (
              <img src={matchup.away.logo} alt={matchup.away.name} className="h-32 w-32 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
            ) : (
              <div className="h-32 w-32" />
            )}
          </div>
        ) : singleTeam ? (
          <div
            className="flex aspect-[16/9] w-full items-center justify-center"
            style={{ background: singleTeam.color }}
          >
            <img src={singleTeam.logo} alt={singleTeam.name} className="h-32 w-32 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
          </div>
        ) : event.coverImageUrl && !isGenericImage ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-100 text-gray-300 dark:bg-neutral-800 dark:text-neutral-600">
            <CategoryIcon category={category} className="h-16 w-16" />
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
        {/* Past event banner */}
        {past && (
          <div className="mb-3 rounded-xl bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">
            This event has ended
          </div>
        )}

        {/* Edit / Delete buttons (only visible to organizer) */}
        <EventActions eventId={event.id} organizerId={(event as any).organizerId ?? null} />

        {/* Category pill + source badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">
            <CategoryIcon category={category} className="h-3.5 w-3.5" /> {category.charAt(0) + category.slice(1).toLowerCase()}
          </div>
          {isExternal && (
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Ticket className="h-3 w-3" />
              {event.source === "TICKETMASTER" ? "Ticketmaster" : event.source === "EVENTBRITE" ? "Eventbrite" : event.source}
            </div>
          )}
        </div>

        {/* Event title */}
        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
          {event.title}
        </h1>

        {/* Date, location, and price details */}
        <div className="mt-4 space-y-3">
          {/* Date and time — client component so it uses browser timezone */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
            <EventDateTime
              startDate={event.startDate}
              endDate={event.endDate}
              isExternal={isExternal}
            />
          </div>

          {/* Location */}
          {event.address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
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
            <p className="font-medium text-gray-900 dark:text-white">
              {formatPrice(event.price, event.isFree)}
            </p>
          </div>
        </div>

        {/* Action buttons: Get Tickets / External Link, Add to Calendar, Get Directions */}
        <div className="mt-4 flex flex-col gap-2">
          {/* Primary CTA: external ticket / event link */}
          {event.url && (
            <a
              href={event.url.match(/^https?:\/\//) ? event.url : `https://${event.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <ExternalLink className="h-4 w-4" />
              {isExternal ? "Get Tickets" : "Visit Link"}
            </a>
          )}
          <a
            href={buildCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
            <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-700 dark:text-neutral-300">
              {event.description}
            </p>
          </div>
        )}

        {/* Organized by */}
        {organizer && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Organized by
            </h2>
            <Link
              href={`/user/${organizer.id}`}
              className="mt-2 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              <UserAvatar
                src={organizer.avatarUrl}
                name={organizer.displayName ?? organizer.username}
                size="sm"
              />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {organizer.displayName ?? organizer.username}
                </p>
                {organizer.username && (
                  <p className="text-sm text-gray-500">@{organizer.username}</p>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Comments / Discussion */}
        <Comments eventId={event.id} organizerId={event.organizerId} />

        {/* Attendee list — who's going */}
        <AttendeeList eventId={event.id} rsvpCount={rsvpCount} />

        {/* Invite Friends */}
        <div className="mt-4">
          <InviteFriendsButton eventId={event.id} />
        </div>

        {/* RSVP Buttons — client component handles auth state and API calls */}
        <RsvpButtons eventId={event.id} initialRsvpCount={rsvpCount} />

        {/* Similar Events — AI-powered recommendations */}
        <SimilarEvents eventId={event.id} />
      </div>
    </MobileContainer>
  );
}
