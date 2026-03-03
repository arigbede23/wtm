// Friends Feed API Route — events that followed users are attending.
// GET: returns events with friendsGoing array (auth required)

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
    // 1. Get list of users the current user follows
    const { data: followings, error: followError } = await supabase
      .from("follows")
      .select("followingId")
      .eq("followerId", user.id);

    if (followError) throw followError;

    const followedIds = (followings ?? []).map((f) => f.followingId);

    if (followedIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Get RSVPs from followed users (GOING status only)
    const { data: friendRsvps, error: rsvpError } = await supabase
      .from("rsvps")
      .select(
        "eventId, userId, users:userId(id, displayName, username, avatarUrl)"
      )
      .in("userId", followedIds)
      .eq("status", "GOING");

    if (rsvpError) throw rsvpError;

    if (!friendRsvps || friendRsvps.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Group friends by event
    const eventFriendsMap: Record<string, any[]> = {};
    for (const rsvp of friendRsvps) {
      if (!eventFriendsMap[rsvp.eventId]) {
        eventFriendsMap[rsvp.eventId] = [];
      }
      eventFriendsMap[rsvp.eventId].push({
        id: (rsvp as any).users?.id ?? rsvp.userId,
        displayName: (rsvp as any).users?.displayName ?? null,
        username: (rsvp as any).users?.username ?? null,
        avatarUrl: (rsvp as any).users?.avatarUrl ?? null,
      });
    }

    const eventIds = Object.keys(eventFriendsMap);

    // 4. Fetch the events themselves
    const { data: events, error: eventError } = await supabase
      .from("events")
      .select("*, rsvps(count)")
      .in("id", eventIds)
      .eq("status", "PUBLISHED")
      .gte("startDate", new Date().toISOString())
      .order("startDate", { ascending: true })
      .limit(50);

    if (eventError) throw eventError;

    // 5. Attach friendsGoing to each event
    const result = (events ?? []).map((event: any) => ({
      ...event,
      _count: { rsvps: event.rsvps?.[0]?.count ?? 0 },
      friendsGoing: eventFriendsMap[event.id] ?? [],
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Friends feed error:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends feed" },
      { status: 500 }
    );
  }
}
