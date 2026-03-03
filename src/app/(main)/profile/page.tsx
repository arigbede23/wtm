// Profile Page — shows the user's account info, created events, and saved events.
// Uses the useAuth hook to check if someone is logged in.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, LogIn, CalendarPlus, Bookmark } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import type { EventWithCounts } from "@/types";

type ProfileTab = "my-events" | "saved";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("my-events");
  const [myEvents, setMyEvents] = useState<EventWithCounts[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventWithCounts[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch events when user or tab changes
  useEffect(() => {
    if (!user) return;

    setLoadingEvents(true);

    if (tab === "my-events") {
      fetch(`/api/events?organizerId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setMyEvents(data);
        })
        .catch(() => {})
        .finally(() => setLoadingEvents(false));
    } else {
      fetch("/api/saved-events")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setSavedEvents(data);
        })
        .catch(() => {})
        .finally(() => setLoadingEvents(false));
    }
  }, [user, tab]);

  // Show a spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  // Not logged in — show sign-in prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-gray-800">
          👤
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100">
          Not signed in
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to save events and RSVP
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </div>
    );
  }

  const events = tab === "my-events" ? myEvents : savedEvents;

  // Logged in — show profile info, tabs, and events
  return (
    <div className="p-4">
      {/* User info */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar circle with the first letter of their email */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {user.email?.[0].toUpperCase()}
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
          {user.email}
        </h2>
        <p className="text-sm text-gray-500">
          Member since {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Tabs: My Events / Saved */}
      <div className="mt-6 flex rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab("my-events")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-l-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            tab === "my-events"
              ? "bg-brand-600 text-white"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          My Events
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-r-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            tab === "saved"
              ? "bg-brand-600 text-white"
              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Saved
        </button>
      </div>

      {/* Event list */}
      <div className="mt-4">
        {loadingEvents ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              {tab === "my-events"
                ? "You haven't created any events yet."
                : "You haven't saved any events yet."}
            </p>
            {tab === "my-events" && (
              <Link
                href="/create"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <CalendarPlus className="h-4 w-4" />
                Create your first event
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Sign out button */}
      <div className="mt-8">
        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
