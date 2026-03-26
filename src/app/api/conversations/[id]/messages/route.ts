// Messages API — fetch and send messages within a conversation.
// GET: fetch messages with cursor pagination, marks conversation as read
// POST: send a new message

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";

function getDirectClient() {
  return createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const dynamic = "force-dynamic";

export async function GET(
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

  const db = getDirectClient();

  try {
    // Verify user is a participant
    const { data: conversation, error: convError } = await db
      .from("conversations")
      .select("id, user1Id, user2Id")
      .eq("id", params.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.user1Id !== user.id &&
      conversation.user2Id !== user.id
    ) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Build messages query
    const { searchParams } = request.nextUrl;
    const before = searchParams.get("before");

    let query = db
      .from("messages")
      .select("id, conversationId, senderId, text, createdAt")
      .eq("conversationId", params.id)
      .order("createdAt", { ascending: true })
      .limit(50);

    if (before) {
      query = query.lt("createdAt", before);
    }

    const { data: messages, error: msgError } = await query;

    if (msgError) throw msgError;

    // Update the user's lastReadAt timestamp
    const isUser1 = conversation.user1Id === user.id;
    const updateField = isUser1 ? "user1LastReadAt" : "user2LastReadAt";

    const { error: updateError } = await db
      .from("conversations")
      .update({ [updateField]: new Date().toISOString() })
      .eq("id", params.id);

    if (updateError) {
      console.error("Failed to update lastReadAt:", updateError);
    }

    return NextResponse.json(messages ?? []);
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
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

  const db = getDirectClient();

  try {
    // Verify user is a participant
    const { data: conversation, error: convError } = await db
      .from("conversations")
      .select("id, user1Id, user2Id")
      .eq("id", params.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.user1Id !== user.id &&
      conversation.user2Id !== user.id
    ) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Insert the message
    const now = new Date().toISOString();

    const { data: message, error: msgError } = await db
      .from("messages")
      .insert({
        id: randomUUID(),
        conversationId: params.id,
        senderId: user.id,
        text,
      })
      .select("id, conversationId, senderId, text, createdAt")
      .single();

    if (msgError) throw msgError;

    // Update conversation's lastMessageAt and sender's lastReadAt
    const isUser1 = conversation.user1Id === user.id;
    const updateField = isUser1 ? "user1LastReadAt" : "user2LastReadAt";

    const { error: updateError } = await db
      .from("conversations")
      .update({
        lastMessageAt: now,
        [updateField]: now,
      })
      .eq("id", params.id);

    if (updateError) {
      console.error("Failed to update conversation lastMessageAt:", updateError);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
