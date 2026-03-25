// User Search API — search for users by name or username.
// GET /api/users/search?q=query

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    let usersQuery = supabase
      .from("users")
      .select("id, displayName, username, avatarUrl, bio")
      .order("createdAt", { ascending: false })
      .limit(50);

    if (query) {
      usersQuery = usersQuery.or(
        `displayName.ilike.%${query}%,username.ilike.%${query}%`
      );
    }

    const { data: users, error } = await usersQuery;

    if (error) throw error;

    // If authenticated, attach follow status for each user
    let results = (users ?? []).map((u: any) => ({
      ...u,
      isFollowing: false,
    }));

    if (currentUser && results.length > 0) {
      const userIds = results.map((u: any) => u.id);
      const { data: follows } = await supabase
        .from("follows")
        .select("followingId")
        .eq("followerId", currentUser.id)
        .in("followingId", userIds);

      const followingSet = new Set(
        (follows ?? []).map((f: any) => f.followingId)
      );

      results = results.map((u: any) => ({
        ...u,
        isFollowing: followingSet.has(u.id),
        isCurrentUser: u.id === currentUser.id,
      }));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
