"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Trash2, MoreVertical } from "lucide-react";
import { UserAvatar } from "@/components/social/UserAvatar";
import { useAuth } from "@/hooks/useAuth";

type Story = {
  id: string;
  mediaUrl: string;
  mediaType: string;
  textOverlay: string | null;
  createdAt: string;
  viewed: boolean;
};

type StoryGroup = {
  userId: string;
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  stories: Story[];
};

type StoryViewerProps = {
  stories: StoryGroup[];
  initialUserIndex: number;
  onClose: () => void;
  onDeleted?: () => void;
};

const STORY_DURATION = 5000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function StoryViewer({
  stories,
  initialUserIndex,
  onClose,
  onDeleted,
}: StoryViewerProps) {
  const { user } = useAuth();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number>(0);

  const currentGroup = stories[userIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const isOwnStory = user?.id === currentGroup?.userId;

  // Mark story as viewed
  useEffect(() => {
    if (!currentStory) return;
    fetch(`/api/stories/${currentStory.id}/view`, { method: "POST" }).catch(() => {});
  }, [currentStory?.id]);

  const goNext = useCallback(() => {
    if (!currentGroup) { onClose(); return; }
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (userIndex < stories.length - 1) {
      setUserIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, userIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      setUserIndex((prev) => prev - 1);
      const prevGroup = stories[userIndex - 1];
      setStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, userIndex, stories]);

  // Progress timer
  useEffect(() => {
    if (paused) return;
    startTimeRef.current = Date.now() - pausedAtRef.current;
    pausedAtRef.current = 0;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        goNext();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userIndex, storyIndex, goNext, paused]);

  // Pause on long press
  const handlePointerDown = () => {
    setPaused(true);
    pausedAtRef.current = progress * STORY_DURATION;
  };

  const handlePointerUp = () => {
    setPaused(false);
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showMenu) { setShowMenu(false); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleDelete = async () => {
    if (!currentStory || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/stories/${currentStory.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted?.();
        // If this was the only story, close viewer
        if (currentGroup.stories.length <= 1) {
          onClose();
        } else {
          // Remove from local state and advance
          goNext();
        }
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Progress bars */}
      <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-2 pt-2">
        {currentGroup.stories.map((s, i) => (
          <div key={s.id} className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white transition-none"
              style={{
                width: i < storyIndex ? "100%" : i === storyIndex ? `${progress * 100}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute left-0 right-0 top-4 z-20 flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-2">
          <UserAvatar
            src={currentGroup.user.avatarUrl}
            name={currentGroup.user.displayName ?? currentGroup.user.username}
            size="sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white drop-shadow">
              {currentGroup.user.displayName ?? currentGroup.user.username ?? "User"}
            </span>
            <span className="text-xs text-white/70 drop-shadow">
              {timeAgo(currentStory.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOwnStory && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                  setPaused(!showMenu);
                }}
                className="rounded-full p-1.5 text-white hover:bg-white/20"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 overflow-hidden rounded-xl bg-neutral-900 shadow-xl">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete Story"}
                  </button>
                </div>
              )}
            </div>
          )}
          <button onClick={onClose} className="rounded-full p-1.5 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="flex h-full items-center justify-center"
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img src={currentStory.mediaUrl} alt="" className="h-full w-full object-contain" />

        {currentStory.textOverlay && (
          <div className="absolute bottom-24 left-0 right-0 px-8 text-center">
            <p
              className="text-xl font-bold text-white"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)" }}
            >
              {currentStory.textOverlay}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
