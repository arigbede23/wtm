// RsvpButtons — client component for Going/Interested toggles on event detail page.
// Fetches user's current RSVP status and allows toggling.
// Invalidates events query cache after changes so feed/map update.

"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

type RsvpButtonsProps = {
  eventId: string;
  initialRsvpCount: number;
};

type RsvpStatus = "GOING" | "INTERESTED" | null;

export default function RsvpButtons({ eventId, initialRsvpCount }: RsvpButtonsProps) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RsvpStatus>(null);
  const [rsvpCount, setRsvpCount] = useState(initialRsvpCount);
  const [loading, setLoading] = useState(false);

  // Fetch user's current RSVP status
  useEffect(() => {
    if (!user) return;

    fetch(`/api/rsvp?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.status) {
          setStatus(data.status as RsvpStatus);
        }
      })
      .catch(() => {});
  }, [user, eventId]);

  const handleRsvp = async (newStatus: "GOING" | "INTERESTED") => {
    if (!user || loading) return;

    setLoading(true);

    // If tapping the same button, cancel the RSVP
    const isCancelling = status === newStatus;
    const sendStatus = isCancelling ? "NOT_GOING" : newStatus;

    // Optimistic update
    const prevStatus = status;
    const prevCount = rsvpCount;

    if (isCancelling) {
      setStatus(null);
      if (prevStatus === "GOING") setRsvpCount((c) => Math.max(0, c - 1));
    } else {
      setStatus(newStatus);
      if (newStatus === "GOING" && prevStatus !== "GOING") setRsvpCount((c) => c + 1);
      if (newStatus !== "GOING" && prevStatus === "GOING") setRsvpCount((c) => Math.max(0, c - 1));
    }

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status: sendStatus }),
      });

      if (!res.ok) throw new Error();

      // Invalidate events cache so feed/map update
      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch {
      // Revert optimistic update on error
      setStatus(prevStatus);
      setRsvpCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="mt-8 pb-8">
        <Link
          href="/login"
          className="block w-full rounded-xl bg-brand-600 py-3.5 text-center font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign in to RSVP
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 pb-8">
      {rsvpCount > 0 && (
        <p className="mb-3 text-sm font-medium text-brand-600">
          {rsvpCount} {rsvpCount === 1 ? "person" : "people"} going
        </p>
      )}

      <button
        onClick={() => handleRsvp("GOING")}
        disabled={loading}
        className={`w-full rounded-xl py-3.5 text-center font-semibold transition-colors ${
          status === "GOING"
            ? "bg-brand-700 text-white ring-2 ring-brand-400"
            : "bg-brand-600 text-white hover:bg-brand-700"
        } disabled:opacity-50`}
      >
        {status === "GOING" ? "Going ✓" : "I'm Going"}
      </button>

      <button
        onClick={() => handleRsvp("INTERESTED")}
        disabled={loading}
        className={`mt-2 w-full rounded-xl border py-3.5 text-center font-semibold transition-colors ${
          status === "INTERESTED"
            ? "border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-400 dark:bg-brand-950 dark:text-brand-300"
            : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        } disabled:opacity-50`}
      >
        {status === "INTERESTED" ? "Interested ✓" : "Interested"}
      </button>
    </div>
  );
}
