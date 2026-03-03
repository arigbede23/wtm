// Public User Profile Page — shows avatar, bio, follow button, counts, and events attending.

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/social/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";
import { EventCard } from "@/components/events/EventCard";
import type { UserProfile, EventWithCounts } from "@/types";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  // Fetch events this user is attending
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setEventsLoading(false);
      return;
    }

    // Fetch via the events API with organizerId filter for created events
    fetch(`/api/events?organizerId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          User not found
        </p>
        <Link
          href="/feed"
          className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const handleFollowerCountChange = (delta: number) => {
    if (profile) {
      setProfile({
        ...profile,
        followerCount: Math.max(0, profile.followerCount + delta),
      });
    }
  };

  // If this is the current user, redirect to /profile
  const isSelf = currentUser?.id === userId;

  return (
    <div className="p-4">
      {/* Back button */}
      <Link
        href={isSelf ? "/profile" : "/feed"}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Profile header */}
      <div className="flex flex-col items-center text-center">
        <UserAvatar
          src={profile.avatarUrl}
          name={profile.displayName ?? profile.username}
          size="lg"
        />

        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
          {profile.displayName ?? profile.username ?? "Anonymous"}
        </h2>

        {profile.username && profile.displayName && (
          <p className="text-sm text-gray-500">@{profile.username}</p>
        )}

        {profile.bio && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {profile.bio}
          </p>
        )}

        {/* Follow counts */}
        <div className="mt-3 flex gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {profile.followerCount}
            </p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {profile.followingCount}
            </p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>

        {/* Follow button */}
        {!isSelf && (
          <div className="mt-4">
            <FollowButton
              targetUserId={userId}
              onCountChange={handleFollowerCountChange}
            />
          </div>
        )}
      </div>

      {/* Events section */}
      <div className="mt-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
          <Calendar className="h-4 w-4" />
          Events
        </h3>

        {eventsLoading ? (
          <div className="mt-4 space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="mt-4 text-center text-sm text-gray-500">
            No events yet
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
