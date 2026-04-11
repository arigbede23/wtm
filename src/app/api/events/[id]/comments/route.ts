// Comments API — GET, POST, DELETE comments for an event.

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
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

  if (text.length > 2000) {
    return NextResponse.json({ error: "Comment is too long (max 2000 characters)" }, { status: 400 });
  }

  // Verify event exists before inserting
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", params.id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ id: randomUUID(), eventId: params.id, userId: user.id, text })
    .select("id, text, createdAt, pinned, userId, user:userId(id, displayName, username, avatarUrl)")
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

export async function DELETE(
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

  const { searchParams } = request.nextUrl;
  const commentId = searchParams.get("commentId");

  if (!commentId) {
    return NextResponse.json({ error: "commentId is required" }, { status: 400 });
  }

  // Verify the comment exists and belongs to the user
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("id, userId")
    .eq("id", commentId)
    .eq("eventId", params.id)
    .single();

  if (fetchError || !comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Delete associated likes first, then the comment
  await supabase.from("comment_likes").delete().eq("commentId", commentId);

  const { error: deleteError } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (deleteError) {
    console.error("Comment delete error:", deleteError);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
