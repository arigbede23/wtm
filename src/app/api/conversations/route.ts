// Conversations API — list and create DM conversations.
// GET: list user's conversations with other user info, last message, unread status
// POST: get or create a conversation with another user

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";

function getDirectClient() {
  return createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDirectClient();

  try {
    // Fetch conversations where user is either user1 or user2
    const { data: conversations, error } = await db
      .from("conversations")
      .select(
        "id, user1Id, user2Id, user1LastReadAt, user2LastReadAt, lastMessageAt, user1:user1Id(id, displayName, username, avatarUrl), user2:user2Id(id, displayName, username, avatarUrl)"
      )
      .or(`user1Id.eq.${user.id},user2Id.eq.${user.id}`)
      .order("lastMessageAt", { ascending: false, nullsFirst: false });

    if (error) throw error;

    if (!conversations || conversations.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch the latest message for each conversation
    const conversationIds = conversations.map((c: any) => c.id);

    const { data: allMessages, error: msgError } = await db
      .from("messages")
      .select("id, conversationId, text, createdAt, senderId")
      .in("conversationId", conversationIds)
      .order("createdAt", { ascending: false });

    if (msgError) throw msgError;

    // Build a map of conversationId -> latest message
    const latestMessageMap: Record<string, any> = {};
    for (const msg of allMessages ?? []) {
      if (!latestMessageMap[msg.conversationId]) {
        latestMessageMap[msg.conversationId] = msg;
      }
    }

    // Shape the response
    const result = conversations.map((c: any) => {
      const isUser1 = c.user1Id === user.id;
      const otherUser = isUser1 ? c.user2 : c.user1;
      const lastReadAt = isUser1 ? c.user1LastReadAt : c.user2LastReadAt;
      const lastMessage = latestMessageMap[c.id] ?? null;

      const unread =
        c.lastMessageAt != null &&
        (lastReadAt == null || c.lastMessageAt > lastReadAt);

      return {
        id: c.id,
        otherUser,
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        unread,
        lastMessageAt: c.lastMessageAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Conversations GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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
  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  if (userId === user.id) {
    return NextResponse.json(
      { error: "Cannot create a conversation with yourself" },
      { status: 400 }
    );
  }

  const db = getDirectClient();

  try {
    // Always put the lexicographically smaller UUID in user1Id for deduplication
    const [u1, u2] = [user.id, userId].sort();

    // Try to find existing conversation
    const { data: existing, error: selectError } = await db
      .from("conversations")
      .select("*")
      .eq("user1Id", u1)
      .eq("user2Id", u2)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new conversation
    const { data: conversation, error: insertError } = await db
      .from("conversations")
      .insert({ user1Id: u1, user2Id: u2 })
      .select("*")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Conversations POST error:", error);
    return NextResponse.json(
      { error: "Failed to get or create conversation" },
      { status: 500 }
    );
  }
}
