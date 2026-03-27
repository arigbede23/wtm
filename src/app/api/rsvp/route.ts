// RSVP API Route — handles creating/updating/deleting RSVPs.
// POST: upsert RSVP (or delete if status is NOT_GOING)
// GET:  get current user's RSVP for a specific event

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/pushNotifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(ip, 30).success) return rateLimitResponse();

  const supabase = createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { eventId, status } = body;

  if (!eventId || !status) {
    return NextResponse.json(
      { error: "eventId and status are required" },
      { status: 400 }
    );
  }

  if (!["GOING", "INTERESTED", "NOT_GOING"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be GOING, INTERESTED, or NOT_GOING" },
      { status: 400 }
    );
  }

  try {
    // If NOT_GOING, delete the RSVP row
    if (status === "NOT_GOING") {
      const { error } = await supabase
        .from("rsvps")
        .delete()
        .eq("userId", user.id)
        .eq("eventId", eventId);

      if (error) throw error;
      return NextResponse.json({ deleted: true });
    }

    // Upsert: create or update the RSVP
    // Uses the unique constraint on (userId, eventId) for conflict resolution
    const { data, error } = await supabase
      .from("rsvps")
      .upsert(
        {
          userId: user.id,
          eventId,
          status,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: "userId,eventId" }
      )
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget: notify followers about this RSVP
    try {
      const notificationType =
        status === "GOING" ? "FRIEND_GOING" : "FRIEND_INTERESTED";

      // Get the user's followers
      const { data: followers } = await supabase
        .from("follows")
        .select("followerId")
        .eq("followingId", user.id);

      if (followers && followers.length > 0) {
        const notifications = followers.map((f) => ({
          userId: f.followerId,
          actorId: user.id,
          type: notificationType,
          eventId,
        }));

        const { error: notifError } = await supabase.from("notifications").insert(notifications);
        if (notifError) console.error("RSVP notification insert error:", notifError);

        // Send push notifications
        const [{ data: actor }, { data: evt }] = await Promise.all([
          supabase
            .from("users")
            .select("displayName, username")
            .eq("id", user.id)
            .single(),
          supabase
            .from("events")
            .select("title")
            .eq("id", eventId)
            .single(),
        ]);

        const actorName = actor?.displayName ?? actor?.username ?? "Someone";
        const eventTitle = evt?.title ?? "an event";
        const verb = status === "GOING" ? "is going to" : "is interested in";

        for (const f of followers) {
          sendPushToUser(supabase, f.followerId, {
            title: "WTM",
            body: `${actorName} ${verb} ${eventTitle}`,
            url: `/event/${eventId}`,
          }).catch((err) => console.error("Push notification error for follower:", f.followerId, err));
        }
      }
    } catch (err) {
      console.error("RSVP notification flow error:", err);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const eventId = request.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "eventId query param is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("userId", user.id)
      .eq("eventId", eventId)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch RSVP:", error);
    return NextResponse.json({ error: "Failed to fetch RSVP" }, { status: 500 });
  }
}
