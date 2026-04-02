// Event Invites API — send and list invites for an event.

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/pushNotifications";

export const dynamic = "force-dynamic";

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
  const recipientIds: string[] = body.recipientIds;

  if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
    return NextResponse.json(
      { error: "recipientIds array is required" },
      { status: 400 }
    );
  }

  const eventId = params.id;

  try {
    // Check for existing invites to avoid dupes
    const { data: existingInvites } = await supabase
      .from("invites")
      .select("recipientId")
      .eq("eventId", eventId)
      .eq("senderId", user.id)
      .in("recipientId", recipientIds);

    const alreadyInvited = new Set(
      (existingInvites ?? []).map((i: any) => i.recipientId)
    );

    const newRecipients = recipientIds.filter((id) => !alreadyInvited.has(id));

    if (newRecipients.length > 0) {
      // Insert new invites
      const inviteRows = newRecipients.map((recipientId) => ({
        id: randomUUID(),
        eventId,
        senderId: user.id,
        recipientId,
        status: "PENDING",
      }));

      await supabase.from("invites").insert(inviteRows);

      // Fetch event title and sender info for notifications
      const [{ data: event }, { data: sender }] = await Promise.all([
        supabase.from("events").select("title").eq("id", eventId).single(),
        supabase
          .from("users")
          .select("displayName, username")
          .eq("id", user.id)
          .single(),
      ]);

      // Create EVENT_INVITE notifications
      const notifications = newRecipients.map((recipientId) => ({
        id: randomUUID(),
        userId: recipientId,
        actorId: user.id,
        type: "EVENT_INVITE" as const,
        eventId,
      }));

      const { error: notifError } = await supabase.from("notifications").insert(notifications);
      if (notifError) console.error("Invite notification insert error:", notifError);

      // Send push notifications
      const senderName =
        sender?.displayName ?? sender?.username ?? "Someone";
      const eventTitle = event?.title ?? "an event";

      for (const recipientId of newRecipients) {
        sendPushToUser(supabase, recipientId, {
          title: "WTM",
          body: `${senderName} invited you to ${eventTitle}`,
          url: `/event/${eventId}`,
        }).catch((err) => console.error("Invite push error for recipient:", recipientId, err));
      }
    }

    return NextResponse.json({
      sent: newRecipients.length,
      alreadyInvited: alreadyInvited.size,
    });
  } catch (error) {
    console.error("Invite send error:", error);
    return NextResponse.json(
      { error: "Failed to send invites" },
      { status: 500 }
    );
  }
}

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

  try {
    const { data: invites, error } = await supabase
      .from("invites")
      .select(
        "id, status, createdAt, recipient:recipientId(id, displayName, username, avatarUrl)"
      )
      .eq("eventId", params.id)
      .eq("senderId", user.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json(invites ?? []);
  } catch (error) {
    console.error("Invite list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}
