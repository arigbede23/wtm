"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/social/UserAvatar";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { StoryCreator } from "@/components/stories/StoryCreator";

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

export function StoryBar() {
  const { user, loading: authLoading } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch("/api/stories");
      if (!res.ok) return;
      const data = await res.json();
      setStoryGroups(data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStories();
    }
  }, [authLoading, user, fetchStories]);

  if (authLoading || !user) return null;

  const myGroup = storyGroups.find((g) => g.userId === user.id);
  const otherGroups = storyGroups.filter((g) => g.userId !== user.id);

  // Build ordered list for the viewer: own stories first, then others
  const viewerGroups: StoryGroup[] = [];
  if (myGroup) viewerGroups.push(myGroup);
  viewerGroups.push(...otherGroups);

  const handleYourStoryTap = () => {
    if (myGroup && myGroup.stories.length > 0) {
      setViewerIndex(0);
      setViewerOpen(true);
    } else {
      setCreatorOpen(true);
    }
  };

  const handleUserTap = (userId: string) => {
    const idx = viewerGroups.findIndex((g) => g.userId === userId);
    if (idx >= 0) {
      setViewerIndex(idx);
      setViewerOpen(true);
    }
  };

  const myHasUnviewed = myGroup
    ? myGroup.stories.some((s) => !s.viewed)
    : false;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto px-4 py-2 no-scrollbar">
        {/* Your Story */}
        <button
          onClick={handleYourStoryTap}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <div className="relative">
            <div
              className={`rounded-full p-[2px] ${
                myGroup && myHasUnviewed
                  ? "bg-gradient-to-tr from-brand-500 to-purple-500"
                  : myGroup
                  ? "bg-gray-300 dark:bg-gray-600"
                  : ""
              }`}
            >
              <div className="rounded-full bg-white p-[2px] dark:bg-black">
                <UserAvatar
                  src={user.user_metadata?.avatarUrl}
                  name={user.user_metadata?.displayName ?? user.email}
                  size="md"
                  className="h-12 w-12"
                />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white ring-2 ring-white dark:ring-black">
              <Plus className="h-3 w-3" />
            </div>
          </div>
          <span className="max-w-[56px] truncate text-[10px] text-gray-600 dark:text-gray-400">
            Your Story
          </span>
        </button>

        {/* Other users' stories */}
        {otherGroups.map((group) => {
          const hasUnviewed = group.stories.some((s) => !s.viewed);
          return (
            <button
              key={group.userId}
              onClick={() => handleUserTap(group.userId)}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <div
                className={`rounded-full p-[2px] ${
                  hasUnviewed
                    ? "bg-gradient-to-tr from-brand-500 to-purple-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div className="rounded-full bg-white p-[2px] dark:bg-black">
                  <UserAvatar
                    src={group.user.avatarUrl}
                    name={group.user.displayName ?? group.user.username}
                    size="md"
                    className="h-12 w-12"
                  />
                </div>
              </div>
              <span className="max-w-[56px] truncate text-[10px] text-gray-600 dark:text-gray-400">
                {group.user.displayName ?? group.user.username ?? "User"}
              </span>
            </button>
          );
        })}
      </div>

      {viewerOpen && viewerGroups.length > 0 && (
        <StoryViewer
          stories={viewerGroups}
          initialUserIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {creatorOpen && (
        <StoryCreator
          onClose={() => setCreatorOpen(false)}
          onCreated={() => fetchStories()}
        />
      )}
    </>
  );
}
