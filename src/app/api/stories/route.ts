// Stories API Route — fetch active stories and create new ones.
// GET: fetch stories from followed users + own stories
// POST: create a new story (expires in 24 hours)

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDirectClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createAnonClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = getDirectClient();

    // Get user's following list
    const { data: follows, error: followsError } = await db
      .from("follows")
      .select("followingId")
      .eq("followerId", user.id);

    if (followsError) throw followsError;

    const followingIds = (follows ?? []).map((f: any) => f.followingId);
    const userIds = [...followingIds, user.id];

    // Fetch active stories for these users
    const { data: stories, error: storiesError } = await db
      .from("stories")
      .select("id, userId, mediaUrl, mediaType, textOverlay, createdAt, expiresAt")
      .in("userId", userIds)
      .gt("expiresAt", new Date().toISOString())
      .order("createdAt", { ascending: true });

    if (storiesError) throw storiesError;

    if (!stories || stories.length === 0) {
      return NextResponse.json([]);
    }

    // Get story IDs to check views
    const storyIds = stories.map((s: any) => s.id);

    const { data: views } = await db
      .from("story_views")
      .select("storyId")
      .eq("viewerId", user.id)
      .in("storyId", storyIds);

    const viewedStoryIds = new Set((views ?? []).map((v: any) => v.storyId));

    // Get unique user IDs from stories
    const storyUserIds = Array.from(new Set(stories.map((s: any) => s.userId)));

    // Fetch user profiles
    const { data: users } = await db
      .from("users")
      .select("id, displayName, username, avatarUrl")
      .in("id", storyUserIds);

    const usersMap = new Map((users ?? []).map((u: any) => [u.id, u]));

    // Group stories by user
    const groupedMap = new Map<string, any>();

    for (const story of stories) {
      const viewed = viewedStoryIds.has(story.id);
      const storyData = { ...story, viewed };

      if (groupedMap.has(story.userId)) {
        groupedMap.get(story.userId).stories.push(storyData);
      } else {
        groupedMap.set(story.userId, {
          userId: story.userId,
          user: usersMap.get(story.userId) ?? {
            id: story.userId,
            displayName: null,
            username: null,
            avatarUrl: null,
          },
          stories: [storyData],
        });
      }
    }

    const groups = Array.from(groupedMap.values());

    // Sort: unviewed stories first, then viewed
    groups.sort((a: any, b: any) => {
      const aHasUnviewed = a.stories.some((s: any) => !s.viewed);
      const bHasUnviewed = b.stories.some((s: any) => !s.viewed);

      if (aHasUnviewed && !bHasUnviewed) return -1;
      if (!aHasUnviewed && bHasUnviewed) return 1;
      return 0;
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Stories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mediaUrl, mediaType, textOverlay } = body;

    if (!mediaUrl) {
      return NextResponse.json(
        { error: "mediaUrl is required" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const db = getDirectClient();
    const { data: story, error } = await db
      .from("stories")
      .insert({
        id: randomUUID(),
        userId: user.id,
        mediaUrl,
        mediaType: mediaType ?? "image",
        textOverlay: textOverlay ?? null,
        expiresAt,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Stories insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create story" },
        { status: 500 }
      );
    }

    return NextResponse.json(story);
  } catch (error: any) {
    console.error("Stories POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create story" },
      { status: 500 }
    );
  }
}
