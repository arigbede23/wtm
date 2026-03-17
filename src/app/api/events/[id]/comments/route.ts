// Comments API — GET and POST comments for an event.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Check auth for likedByMe
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, text, createdAt, pinned, userId, user:userId(id, displayName, username, avatarUrl)")
    .eq("eventId", params.id)
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }

  if (!comments || comments.length === 0) {
    return NextResponse.json([]);
  }

  // Batch-query like counts for all comments
  const commentIds = comments.map((c: any) => c.id);

  const { data: likeCounts } = await supabase
    .from("comment_likes")
    .select("commentId")
    .in("commentId", commentIds);

  // Count likes per comment
  const likeCountMap: Record<string, number> = {};
  for (const like of likeCounts ?? []) {
    likeCountMap[like.commentId] = (likeCountMap[like.commentId] ?? 0) + 1;
  }

  // Check which comments the current user has liked
  let userLikeSet = new Set<string>();
  if (user) {
    const { data: userLikes } = await supabase
      .from("comment_likes")
      .select("commentId")
      .eq("userId", user.id)
      .in("commentId", commentIds);

    userLikeSet = new Set((userLikes ?? []).map((l: any) => l.commentId));
  }

  // Attach like data and sort pinned first
  const enriched = comments.map((c: any) => ({
    ...c,
    likeCount: likeCountMap[c.id] ?? 0,
    likedByMe: userLikeSet.has(c.id),
    pinned: c.pinned ?? false,
  }));

  enriched.sort((a: any, b: any) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return NextResponse.json(enriched);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ eventId: params.id, userId: user.id, text })
    .select("id, text, createdAt, userId, user:userId(id, displayName, username, avatarUrl)")
    .single();

  if (error) {
    console.error("Comment insert error:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }

  return NextResponse.json(comment, { status: 201 });
}
