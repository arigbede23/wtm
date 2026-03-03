// User Profile API Route — public profile with follower/following counts.
// GET: returns public user info

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    // Fetch user profile
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, displayName, avatarUrl, bio, createdAt")
      .eq("id", params.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get follower/following counts
    const [{ count: followerCount }, { count: followingCount }] =
      await Promise.all([
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("followingId", params.id),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("followerId", params.id),
      ]);

    return NextResponse.json({
      ...user,
      followerCount: followerCount ?? 0,
      followingCount: followingCount ?? 0,
    });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
