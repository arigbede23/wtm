// Follow API Route — handles following/unfollowing users.
// GET: check follow status and counts
// POST: toggle follow/unfollow, creates NEW_FOLLOWER notification on follow

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { searchParams } = request.nextUrl;
  const list = searchParams.get("list");

  // Return the current user's following list
  if (list === "following") {
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
      const { data: follows, error } = await supabase
        .from("follows")
        .select("following:followingId(id, displayName, username, avatarUrl)")
        .eq("followerId", user.id);

      if (error) throw error;

      const following = (follows ?? []).map((f: any) => f.following);
      return NextResponse.json({ following });
    } catch (error) {
      console.error("Follow list error:", error);
      return NextResponse.json(
        { error: "Failed to fetch following list" },
        { status: 500 }
      );
    }
  }

  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query param is required" },
      { status: 400 }
    );
  }

  try {
    // Get follower/following counts
    const [{ count: followerCount }, { count: followingCount }] =
      await Promise.all([
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("followingId", userId),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("followerId", userId),
      ]);

    // Check if current user follows this user
    let isFollowing = false;
    if (user) {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("followerId", user.id)
        .eq("followingId", userId)
        .maybeSingle();
      isFollowing = !!data;
    }

    return NextResponse.json({
      isFollowing,
      followerCount: followerCount ?? 0,
      followingCount: followingCount ?? 0,
    });
  } catch (error) {
    console.error("Follow GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow status" },
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

  const body = await request.json();
  const { targetUserId } = body;

  if (!targetUserId) {
    return NextResponse.json(
      { error: "targetUserId is required" },
      { status: 400 }
    );
  }

  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 }
    );
  }

  try {
    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("followerId", user.id)
      .eq("followingId", targetUserId)
      .maybeSingle();

    if (existing) {
      // Unfollow — delete the follow row
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;
      return NextResponse.json({ followed: false });
    } else {
      // Follow — insert new row
      const { error } = await supabase.from("follows").insert({
        followerId: user.id,
        followingId: targetUserId,
      });

      if (error) throw error;

      // Create NEW_FOLLOWER notification (non-blocking)
      try {
        const { error: notifError } = await supabase.from("notifications").insert({
          userId: targetUserId,
          actorId: user.id,
          type: "NEW_FOLLOWER",
        });
        if (notifError) console.error("Follow notification insert error:", notifError);
      } catch (err) {
        console.error("Follow notification flow error:", err);
      }

      return NextResponse.json({ followed: true });
    }
  } catch (error) {
    console.error("Follow POST error:", error);
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    );
  }
}
