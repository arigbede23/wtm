// Comments — fetches and displays comments for an event, with a post form.
// Supports comment likes and organizer pinning.

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Pin } from "lucide-react";
import { UserAvatar } from "@/components/social/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  pinned: boolean;
  likeCount: number;
  likedByMe: boolean;
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
};

type CommentsProps = {
  eventId: string;
  organizerId?: string;
};

export function Comments({ eventId, organizerId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Check auth status by looking for supabase auth cookie
    const loggedIn = document.cookie.includes("sb-");
    setIsLoggedIn(loggedIn);
  }, [eventId]);

  async function handlePost() {
    const trimmed = text.trim();
    if (!trimmed || posting) return;

    setPosting(true);

    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, { ...comment, likeCount: 0, likedByMe: false, pinned: false }]);
        setText("");
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(commentId: string) {
    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likedByMe: !c.likedByMe,
              likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
            }
          : c
      )
    );

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const { liked, likeCount } = await res.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, likedByMe: liked, likeCount } : c
          )
        );
      }
    } catch {
      // Revert on error — refetch
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likedByMe: !c.likedByMe,
                likeCount: c.likedByMe ? c.likeCount - 1 : c.likeCount + 1,
              }
            : c
        )
      );
    }
  }

  async function handlePin(commentId: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}/pin`, {
        method: "POST",
      });
      if (res.ok) {
        const { pinned } = await res.json();
        setComments((prev) => {
          const updated = prev.map((c) =>
            c.id === commentId ? { ...c, pinned } : c
          );
          // Re-sort: pinned first
          return updated.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
          });
        });
      }
    } catch {
      // Silently fail
    }
  }

  const isOrganizer = organizerId && currentUserId === organizerId;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
        Discussion
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">No comments yet. Be the first!</p>
      ) : (
        <div className="mt-3 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              {comment.pinned && (
                <div className="mb-1 flex items-center gap-1 text-xs text-brand-600">
                  <Pin className="h-3 w-3" />
                  <span className="font-medium">Pinned</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Link href={`/user/${comment.user.id}`} className="shrink-0">
                  <UserAvatar
                    src={comment.user.avatarUrl}
                    name={comment.user.displayName ?? comment.user.username}
                    size="sm"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <Link
                      href={`/user/${comment.user.id}`}
                      className="text-sm font-medium text-gray-900 hover:underline dark:text-gray-100"
                    >
                      {comment.user.displayName ?? comment.user.username ?? "User"}
                    </Link>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                    {comment.text}
                  </p>
                  {/* Like button and organizer pin */}
                  <div className="mt-1 flex items-center gap-3">
                    {isLoggedIn && (
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-red-500"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            comment.likedByMe
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                        {comment.likeCount > 0 && (
                          <span
                            className={
                              comment.likedByMe ? "text-red-500" : ""
                            }
                          >
                            {comment.likeCount}
                          </span>
                        )}
                      </button>
                    )}
                    {!isLoggedIn && comment.likeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Heart className="h-3.5 w-3.5" />
                        {comment.likeCount}
                      </span>
                    )}
                    {organizerId && isLoggedIn && (
                      <button
                        onClick={() => handlePin(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.pinned
                            ? "text-brand-600"
                            : "text-gray-400 hover:text-brand-500"
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5" />
                        {comment.pinned ? "Unpin" : "Pin"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post form — only shown if logged in */}
      {isLoggedIn && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            placeholder="Add a comment..."
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
