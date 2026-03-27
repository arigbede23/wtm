// Unread conversations count API — returns number of conversations with unread messages.
// GET: count conversations where lastMessageAt > user's lastReadAt

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";

function getDirectClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createAnonClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
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
    // Fetch all conversations where user is a participant and there are messages
    const { data: conversations, error } = await db
      .from("conversations")
      .select("id, user1Id, user2Id, user1LastReadAt, user2LastReadAt, lastMessageAt")
      .or(`user1Id.eq.${user.id},user2Id.eq.${user.id}`)
      .not("lastMessageAt", "is", null);

    if (error) throw error;

    let count = 0;
    for (const c of conversations ?? []) {
      const isUser1 = c.user1Id === user.id;
      const lastReadAt = isUser1 ? c.user1LastReadAt : c.user2LastReadAt;

      if (lastReadAt == null || c.lastMessageAt > lastReadAt) {
        count++;
      }
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unread count GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
