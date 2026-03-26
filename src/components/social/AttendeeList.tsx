// AttendeeList — overlapping avatar row + "N going" text.
// Tapping opens a slide-up sheet showing the full attendee list with
// "Going" and "Interested" tabs, profile links, and follow buttons.

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Users } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "./UserAvatar";
import { FollowButton } from "./FollowButton";

type Attendee = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  status: "GOING" | "INTERESTED";
};

type AttendeeListProps = {
  eventId: string;
  rsvpCount: number;
};

type Tab = "GOING" | "INTERESTED";

export function AttendeeList({ eventId, rsvpCount }: AttendeeListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("GOING");
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/attendees`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAttendees(data);
      })
      .catch(() => {});
  }, [eventId]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!sheetOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sheetOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === backdropRef.current) {
        setSheetOpen(false);
      }
    },
    []
  );

  if (rsvpCount === 0 && attendees.length === 0) return null;

  const goingAttendees = attendees.filter((a) => a.status === "GOING");
  const interestedAttendees = attendees.filter((a) => a.status === "INTERESTED");
  const displayCount = Math.max(rsvpCount, goingAttendees.length);
  const previewAttendees = goingAttendees.slice(0, 5);
  const filteredAttendees = activeTab === "GOING" ? goingAttendees : interestedAttendees;

  return (
    <>
      {/* Compact preview row — tap to open sheet */}
      <div className="mt-4">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-neutral-800 dark:active:bg-neutral-700"
        >
          {previewAttendees.length > 0 ? (
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
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
              <Users className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <span className="text-sm font-medium text-brand-600">
            {displayCount} {displayCount === 1 ? "person" : "people"} going
            {interestedAttendees.length > 0 &&
              ` · ${interestedAttendees.length} interested`}
          </span>
        </button>
      </div>

      {/* Slide-up sheet / modal */}
      {sheetOpen && (
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg animate-in slide-in-from-bottom duration-300 ease-out">
            <div className="max-h-[75vh] overflow-hidden rounded-t-2xl bg-white shadow-xl dark:bg-neutral-900">
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pb-0 pt-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Who&apos;s Going
                  </h2>
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-3 flex gap-1">
                  <TabButton
                    label="Going"
                    count={goingAttendees.length}
                    active={activeTab === "GOING"}
                    onClick={() => setActiveTab("GOING")}
                  />
                  <TabButton
                    label="Interested"
                    count={interestedAttendees.length}
                    active={activeTab === "INTERESTED"}
                    onClick={() => setActiveTab("INTERESTED")}
                  />
                </div>
              </div>

              {/* Attendee list */}
              <div className="overflow-y-auto overscroll-contain px-2 py-2" style={{ maxHeight: "calc(75vh - 110px)" }}>
                {filteredAttendees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-10 w-10 text-gray-300 dark:text-neutral-600" />
                    <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
                      {activeTab === "GOING"
                        ? "No one has RSVP'd yet"
                        : "No one is interested yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredAttendees.map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        <Link
                          href={`/user/${attendee.id}`}
                          onClick={() => setSheetOpen(false)}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <UserAvatar
                            src={attendee.avatarUrl}
                            name={attendee.displayName ?? attendee.username}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {attendee.displayName ?? attendee.username ?? "Anonymous"}
                            </p>
                            {attendee.username && (
                              <p className="truncate text-xs text-gray-500 dark:text-neutral-400">
                                @{attendee.username}
                              </p>
                            )}
                          </div>
                        </Link>
                        <div className="shrink-0">
                          <FollowButton targetUserId={attendee.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Tab button used inside the sheet header */
function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "text-brand-600 dark:text-brand-400"
          : "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300"
      }`}
    >
      {label} ({count})
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />
      )}
    </button>
  );
}
