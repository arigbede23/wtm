// EventCard — displays a single event as a card in the feed.
// Shows the cover image, category badge, price, title, date, and location.
// The whole card is a link to the event detail page.

import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { cn, formatEventDateTime, formatPrice, friendsGoingText, isEventPast } from "@/lib/utils";
import { type EventWithCounts } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { UserAvatar } from "@/components/social/UserAvatar";
import { parseMatchup, findTeamInTitle } from "@/lib/sportsTeams";

type FriendInfo = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

export function EventCard({
  event,
}: {
  event: EventWithCounts & { distance?: number; friendsGoing?: FriendInfo[] };
}) {
  const past = isEventPast(event.startDate, event.endDate);
  const isSport = event.category === "SPORTS";
  const matchup = isSport ? parseMatchup(event.title) : null;
  const singleTeam = isSport && !matchup && !event.coverImageUrl ? findTeamInTitle(event.title) : null;

  return (
    <Link href={`/event/${event.id}`} className="block">
      <article className={cn("group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900", past && "opacity-60")}>
        {/* Cover Image */}
        <div className="relative aspect-[2/1] overflow-hidden bg-gray-100 dark:bg-neutral-800">
          {matchup && (matchup.home || matchup.away) ? (
            <div
              className="flex h-full items-center justify-center gap-8"
              style={{
                background: `linear-gradient(to right, ${matchup.home?.color ?? "#333"} 50%, ${matchup.away?.color ?? "#333"} 50%)`,
              }}
            >
              {matchup.home ? (
                <img src={matchup.home.logo} alt={matchup.home.name} className="h-24 w-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
              ) : (
                <div className="h-24 w-24" />
              )}
              {matchup.away ? (
                <img src={matchup.away.logo} alt={matchup.away.name} className="h-24 w-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
              ) : (
                <div className="h-24 w-24" />
              )}
            </div>
          ) : event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : singleTeam ? (
            <div
              className="flex h-full items-center justify-center"
              style={{ background: singleTeam.color }}
            >
              <img src={singleTeam.logo} alt={singleTeam.name} className="h-24 w-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 dark:text-neutral-600">
              <CategoryIcon category={event.category} className="h-12 w-12" />
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
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <CategoryIcon category={event.category} className="h-3 w-3" />
            {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
          </div>

          {/* Ended badge — bottom left corner */}
          {past && (
            <div className="absolute bottom-3 left-3 rounded-full bg-gray-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Ended
            </div>
          )}
        </div>

        {/* Card body — text content below the image */}
        <div className="p-4">
          <h3 className="text-base font-semibold leading-tight text-gray-900 dark:text-white">
            {event.title}
          </h3>

          {/* Date and time */}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatEventDateTime(event.startDate, { source: event.source })}</span>
          </div>

          {/* Location */}
          {event.address && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-neutral-400">
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

          {/* Friends going */}
          {event.friendsGoing && event.friendsGoing.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {event.friendsGoing.slice(0, 3).map((friend) => (
                  <UserAvatar
                    key={friend.id}
                    src={friend.avatarUrl}
                    name={friend.displayName ?? friend.username}
                    size="sm"
                    className="ring-2 ring-white dark:ring-neutral-900"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-400">
                {friendsGoingText(event.friendsGoing)}
              </p>
            </div>
          )}

          {/* RSVP count */}
          {event._count.rsvps > 0 && (!event.friendsGoing || event.friendsGoing.length === 0) && (
            <p className="mt-2 text-xs text-brand-600 font-medium">
              {event._count.rsvps} {event._count.rsvps === 1 ? "person" : "people"} going
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
