// Comment Like API — toggle like on a comment.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const commentId = params.id;

  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("commentId", commentId)
      .eq("userId", user.id)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from("comment_likes").delete().eq("id", existing.id);
    } else {
      // Like
      await supabase
        .from("comment_likes")
        .insert({ commentId, userId: user.id });
    }

    // Get updated count
    const { count } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("commentId", commentId);

    return NextResponse.json({
      liked: !existing,
      likeCount: count ?? 0,
    });
  } catch (error) {
    console.error("Comment like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
