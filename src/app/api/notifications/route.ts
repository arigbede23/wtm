// Notifications API Route — fetch and manage notifications.
// GET: list user's notifications with actor/event details
// POST: mark one or all notifications as read

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select(
        "id, type, read, createdAt, actorId, eventId, actor:actorId(id, displayName, username, avatarUrl), event:eventId(id, title)"
      )
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Reshape to match NotificationItem type
    const result = (notifications ?? []).map((n: any) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      actor: {
        id: n.actor?.id ?? n.actorId,
        displayName: n.actor?.displayName ?? null,
        username: n.actor?.username ?? null,
        avatarUrl: n.actor?.avatarUrl ?? null,
      },
      event: n.event
        ? { id: n.event.id, title: n.event.title }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
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
  const { action, notificationId } = body;

  if (action !== "markRead") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    if (notificationId) {
      // Mark a single notification as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("userId", user.id);

      if (error) throw error;
    } else {
      // Mark all as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("userId", user.id)
        .eq("read", false);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
