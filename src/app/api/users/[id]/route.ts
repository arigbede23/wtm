// User Profile API Route — public profile with follower/following counts.
// GET: returns public user info
// PATCH: updates own profile (displayName, username, bio, avatarUrl)

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    // Auth check — must be the same user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== params.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, username, bio, avatarUrl } = body;

    // Build update payload with only provided fields
    const updates: Record<string, unknown> = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    // Validate username uniqueness if provided
    if (username !== undefined) {
      if (username) {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .neq("id", params.id)
          .single();

        if (existing) {
          return NextResponse.json(
            { error: "Username is already taken" },
            { status: 409 }
          );
        }
      }
      updates.username = username || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", params.id)
      .select("id, username, displayName, avatarUrl, bio, createdAt")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
