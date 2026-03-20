// AttendeeList — overlapping avatar row + "N going" text.
// Fetches attendees for a given event. Expandable to show full list.

"use client";

import { useState, useEffect } from "react";
import { UserAvatar } from "./UserAvatar";
import Link from "next/link";

type Attendee = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

type AttendeeListProps = {
  eventId: string;
  rsvpCount: number;
};

export function AttendeeList({ eventId, rsvpCount }: AttendeeListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}/attendees`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAttendees(data);
      })
      .catch(() => {});
  }, [eventId]);

  if (rsvpCount === 0 && attendees.length === 0) return null;

  const displayCount = Math.max(rsvpCount, attendees.length);
  const previewAttendees = attendees.slice(0, 5);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2"
      >
        {/* Overlapping avatars */}
        {previewAttendees.length > 0 && (
          <div className="flex -space-x-2">
            {previewAttendees.map((attendee) => (
              <UserAvatar
                key={attendee.id}
                src={attendee.avatarUrl}
                name={attendee.displayName ?? attendee.username}
                size="sm"
                className="ring-2 ring-white dark:ring-black"
              />
            ))}
          </div>
        )}
        <span className="text-sm font-medium text-brand-600">
          {displayCount} {displayCount === 1 ? "person" : "people"} going
        </span>
      </button>

      {/* Expanded attendee list */}
      {expanded && attendees.length > 0 && (
        <div className="mt-3 space-y-2">
          {attendees.map((attendee) => (
            <Link
              key={attendee.id}
              href={`/user/${attendee.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              <UserAvatar
                src={attendee.avatarUrl}
                name={attendee.displayName ?? attendee.username}
                size="sm"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {attendee.displayName ?? attendee.username ?? "Anonymous"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
