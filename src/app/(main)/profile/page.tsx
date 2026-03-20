// Profile Page — shows the user's account info, created events, and saved events.
// Uses the useAuth hook to check if someone is logged in.
// Includes inline profile editing (avatar, display name, username, bio).

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { uploadAvatarImage } from "@/lib/uploadImage";
import { LogOut, LogIn, CalendarPlus, Bookmark, Users, Pencil, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { UserAvatar } from "@/components/social/UserAvatar";
import { CATEGORIES } from "@/lib/constants";
import { PushNotificationToggle } from "@/components/settings/PushNotificationToggle";
import { CATEGORY_EMOJI } from "@/types";
import type { EventWithCounts, UserProfile, EventCategory } from "@/types";

type ProfileTab = "my-events" | "saved" | "attending";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("my-events");
  const [myEvents, setMyEvents] = useState<EventWithCounts[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventWithCounts[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventWithCounts[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Profile data from DB
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interest editing state
  const [interests, setInterests] = useState<string[]>([]);
  const [editingInterests, setEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [savingInterests, setSavingInterests] = useState(false);

  // Fetch DB profile
  useEffect(() => {
    if (!user) return;

    fetch(`/api/users/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setProfile(data);
        }
      })
      .catch(() => {});
  }, [user]);

  // Fetch follower/following counts
  useEffect(() => {
    if (!user) return;

    fetch(`/api/follow?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFollowerCount(data.followerCount ?? 0);
        setFollowingCount(data.followingCount ?? 0);
      })
      .catch(() => {});
  }, [user]);

  // Fetch interests
  useEffect(() => {
    if (!user) return;

    fetch("/api/users/interests")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.interests)) setInterests(data.interests);
      })
      .catch(() => {});
  }, [user]);

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
    } else if (tab === "saved") {
      fetch("/api/saved-events")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setSavedEvents(data);
        })
        .catch(() => {})
        .finally(() => setLoadingEvents(false));
    } else if (tab === "attending") {
      fetch("/api/attending")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAttendingEvents(data);
        })
        .catch(() => {})
        .finally(() => setLoadingEvents(false));
    }
  }, [user, tab]);

  const startEditing = () => {
    setEditDisplayName(profile?.displayName || "");
    setEditUsername(profile?.username || "");
    setEditBio(profile?.bio || "");
    setEditAvatarUrl(profile?.avatarUrl || "");
    setAvatarPreview(profile?.avatarUrl || null);
    setAvatarFile(null);
    setEditError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (avatarPreview && avatarPreview !== profile?.avatarUrl) {
      URL.revokeObjectURL(avatarPreview);
    }
    setEditing(false);
    setEditError("");
  };

  const startEditingInterests = () => {
    setSelectedInterests(new Set(interests));
    setEditingInterests(true);
  };

  const toggleInterest = (category: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    const updated = Array.from(selectedInterests);
    try {
      await fetch("/api/users/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: updated }),
      });
      setInterests(updated);
      setEditingInterests(false);
      // Fire-and-forget: re-generate user embedding
      fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "embed-user" }),
      }).catch(() => {});
    } catch {
      // Silently fail — user can retry
    } finally {
      setSavingInterests(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let processedFile = file;

    // Convert HEIC/HEIF to JPEG (Chrome doesn't support HEIC natively)
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (isHeic) {
      try {
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const result = Array.isArray(blob) ? blob[0] : blob;
        processedFile = new File([result], "avatar.jpg", { type: "image/jpeg" });
      } catch {
        // If conversion fails, try using the file as-is
      }
    }

    setAvatarFile(processedFile);
    setAvatarPreview(URL.createObjectURL(processedFile));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setEditError("");

    try {
      let avatarUrl = editAvatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadAvatarImage(avatarFile);
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editDisplayName || null,
          username: editUsername || null,
          bio: editBio || null,
          avatarUrl: avatarUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updated = await res.json();
      setProfile((prev) =>
        prev
          ? { ...prev, ...updated }
          : { ...updated, followerCount: 0, followingCount: 0 }
      );
      setEditing(false);
    } catch (err: any) {
      setEditError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-neutral-800">
          👤
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
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

  const displayName = profile?.displayName || user.email;
  const avatarUrl = profile?.avatarUrl || null;

  const allEvents =
    tab === "my-events"
      ? myEvents
      : tab === "saved"
        ? savedEvents
        : attendingEvents;

  const now = Date.now();
  const upcomingEvents = allEvents.filter(
    (e) => new Date(e.endDate ?? e.startDate).getTime() >= now
  );
  const pastEvents = allEvents.filter(
    (e) => new Date(e.endDate ?? e.startDate).getTime() < now
  );

  // Logged in — show profile info, tabs, and events
  return (
    <div className="p-4">
      {/* User info */}
      <div className="flex flex-col items-center text-center">
        <UserAvatar
          src={avatarUrl}
          name={displayName}
          size="lg"
        />
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          {displayName}
        </h2>
        {profile?.username && (
          <p className="text-sm text-gray-500">@{profile.username}</p>
        )}
        {profile?.bio && (
          <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
            {profile.bio}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Member since {new Date(user.created_at).toLocaleDateString()}
        </p>

        {/* Interests */}
        {!editingInterests && interests.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {interests.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {CATEGORY_EMOJI[cat as EventCategory]} {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </span>
            ))}
            <button
              onClick={startEditingInterests}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:text-neutral-300"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          </div>
        )}
        {!editingInterests && interests.length === 0 && (
          <button
            onClick={startEditingInterests}
            className="mt-3 text-xs text-brand-600 hover:text-brand-700"
          >
            + Add interests
          </button>
        )}
        {editingInterests && (
          <div className="mt-3 w-full rounded-xl border border-gray-200 p-4 dark:border-neutral-700">
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-neutral-300">
              Select your interests
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ value, label }) => {
                const isSelected = selectedInterests.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleInterest(value)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
                    }`}
                  >
                    <span className="text-base">{CATEGORY_EMOJI[value]}</span>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSaveInterests}
                disabled={savingInterests}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {savingInterests ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Interests"
                )}
              </button>
              <button
                onClick={() => setEditingInterests(false)}
                disabled={savingInterests}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Follower / Following counts */}
        <div className="mt-3 flex gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {followerCount}
            </p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {followingCount}
            </p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>

        {/* Edit Profile button */}
        {!editing && (
          <button
            onClick={startEditing}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="mt-4 space-y-4 rounded-xl border border-gray-200 p-4 dark:border-neutral-700">
          {/* Avatar upload */}
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UserAvatar
                src={avatarPreview}
                name={editDisplayName || user.email}
                size="lg"
              />
              <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <p className="mt-1 text-xs text-gray-500">Tap to change avatar</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Display Name
            </label>
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          {/* Username */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                @
              </span>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="username"
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          {/* Error */}
          {editError && (
            <p className="text-sm text-red-600">{editError}</p>
          )}

          {/* Save / Cancel */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs: My Events / Saved / Attending — pill toggle */}
      <div className="mt-6 flex gap-1 rounded-full bg-gray-100 p-1 dark:bg-neutral-800">
        <button
          onClick={() => setTab("my-events")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-2.5 text-xs font-medium transition-colors ${
            tab === "my-events"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          My Events
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-2.5 text-xs font-medium transition-colors ${
            tab === "saved"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Saved
        </button>
        <button
          onClick={() => setTab("attending")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-2.5 text-xs font-medium transition-colors ${
            tab === "attending"
              ? "bg-brand-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Attending
        </button>
      </div>

      {/* Event list */}
      <div className="mt-4">
        {loadingEvents ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : allEvents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">
              {tab === "my-events"
                ? "You haven't created any events yet."
                : tab === "saved"
                ? "You haven't saved any events yet."
                : "You're not attending any events yet."}
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
          <>
            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Upcoming
                </h3>
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Past events */}
            {pastEvents.length > 0 && (
              <div className={upcomingEvents.length > 0 ? "mt-6 space-y-4" : "space-y-4"}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Past
                </h3>
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings */}
      <div className="mt-8 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Settings
        </h2>
        <PushNotificationToggle />
        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
