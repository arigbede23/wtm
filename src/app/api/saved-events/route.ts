// Saved Events API Route — handles bookmarking/saving events.
// POST: toggle save (insert if not saved, delete if already saved)
// GET:  list user's saved events with full event details

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { eventId } = body;

  if (!eventId) {
    return NextResponse.json(
      { error: "eventId is required" },
      { status: 400 }
    );
  }

  try {
    // Check if already saved
    const { data: existing } = await supabase
      .from("saved_events")
      .select("id")
      .eq("userId", user.id)
      .eq("eventId", eventId)
      .maybeSingle();

    if (existing) {
      // Already saved → unsave (delete)
      const { error } = await supabase
        .from("saved_events")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;
      return NextResponse.json({ saved: false });
    } else {
      // Not saved → save (insert)
      const { error } = await supabase
        .from("saved_events")
        .insert({ userId: user.id, eventId });

      if (error) throw error;
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("Save event error:", error);
    return NextResponse.json(
      { error: "Failed to toggle saved event" },
      { status: 500 }
    );
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

  try {
    // Fetch saved events with full event details (exclude embedding to keep response small)
    const { data, error } = await supabase
      .from("saved_events")
      .select(
        `id, eventId, createdAt,
         events:eventId(
           id, title, description, category, address, city, state,
           lat, lng, startDate, endDate, coverImageUrl, isFree, price,
           url, status, rsvps(count)
         )`
      )
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // Reshape to match EventWithCounts format
    const events = (data ?? [])
      .filter((s: any) => s.events)
      .map((s: any) => ({
        ...s.events,
        _count: {
          rsvps: s.events.rsvps?.[0]?.count ?? 0,
        },
      }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch saved events:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved events" },
      { status: 500 }
    );
  }
}
