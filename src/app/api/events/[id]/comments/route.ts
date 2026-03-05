// Comments API — GET and POST comments for an event.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, text, createdAt, userId, user:userId(id, displayName, username, avatarUrl)")
    .eq("eventId", params.id)
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }

  return NextResponse.json(comments ?? []);
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
