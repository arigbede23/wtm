// Event API Route — update and delete individual events.
// PATCH: update event (creator-only)
// DELETE: delete event (creator-only)

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/pushNotifications";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = [
  "MUSIC", "SPORTS", "ARTS", "FOOD", "TECH", "SOCIAL",
  "COMEDY", "WELLNESS", "OUTDOORS", "NIGHTLIFE", "COMMUNITY", "OTHER",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch event to verify ownership
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("organizerId")
      .eq("id", params.id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();

    // Build update payload with only provided fields
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      "title", "description", "category", "startDate", "endDate",
      "address", "city", "state", "lat", "lng",
      "coverImageUrl", "isFree", "price", "url", "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Validate category if provided
    if (updates.category && !VALID_CATEGORIES.includes(updates.category as string)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Always set updatedAt (Prisma's @updatedAt doesn't create a DB default)
    updates.updatedAt = new Date().toISOString();

    if (Object.keys(updates).length === 1) {
      // Only updatedAt — no real changes
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("events")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      console.error("Event update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update event" },
        { status: 500 }
      );
    }

    // Fire-and-forget re-embed if title or description changed
    if (updates.title !== undefined || updates.description !== undefined) {
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? request.nextUrl.origin : ""}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "embed-event", eventId: params.id }),
      }).catch(() => {});
    }

    // Fire-and-forget: notify attendees about the update
    (async () => {
      try {
        const { data: rsvps } = await supabase
          .from("rsvps")
          .select("userId")
          .eq("eventId", params.id)
          .in("status", ["GOING", "INTERESTED"]);
        if (!rsvps || rsvps.length === 0) return;
        const notifications = rsvps
          .filter((r) => r.userId !== user.id)
          .map((r) => ({
            id: randomUUID(),
            type: "EVENT_UPDATED" as const,
            userId: r.userId,
            actorId: user.id,
            eventId: params.id,
          }));
        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);

          // Send push notifications
          const { data: actor } = await supabase
            .from("users")
            .select("displayName, username")
            .eq("id", user.id)
            .single();
          const actorName = actor?.displayName ?? actor?.username ?? "Someone";
          const eventTitle = updated?.title ?? "an event";

          for (const n of notifications) {
            sendPushToUser(supabase, n.userId, {
              title: "WTM",
              body: `${actorName} updated ${eventTitle}`,
              url: `/event/${params.id}`,
            }).catch(() => {});
          }
        }
      } catch {
        // Best-effort — don't block the response
      }
    })();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Event PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch event to verify ownership
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("organizerId")
      .eq("id", params.id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Event delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Event DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
