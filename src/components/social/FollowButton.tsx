// FollowButton — toggle button to follow/unfollow a user.
// Checks auth, does optimistic updates. Mirrors the SaveButton pattern.

"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

type FollowButtonProps = {
  targetUserId: string;
  onCountChange?: (followerDelta: number) => void;
};

export function FollowButton({ targetUserId, onCountChange }: FollowButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check follow status on mount
  useEffect(() => {
    if (!user || user.id === targetUserId) return;

    fetch(`/api/follow?userId=${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setIsFollowing(!!data.isFollowing);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [user, targetUserId]);

  // Don't show follow button for yourself
  if (!authLoading && user?.id === targetUserId) return null;

  // Show login link if not authenticated
  if (!authLoading && !user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <UserPlus className="h-4 w-4" />
        Follow
      </Link>
    );
  }

  const handleToggle = async () => {
    if (!user || loading) return;

    setLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing); // Optimistic
    onCountChange?.(wasFollowing ? -1 : 1);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Follow error:", res.status, data);
        throw new Error(data.error || "Follow failed");
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      setIsFollowing(wasFollowing); // Revert
      onCountChange?.(wasFollowing ? 1 : -1);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          : "bg-brand-600 text-white hover:bg-brand-700"
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </button>
  );
}
