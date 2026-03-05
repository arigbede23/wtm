// Attending Events API Route — returns events the user RSVP'd GOING to.
// GET: list events where the user has an active GOING RSVP.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
    const { data, error } = await supabase
      .from("rsvps")
      .select(
        `id, eventId, status,
         events:eventId(
           id, title, description, category, address, city, state,
           lat, lng, startDate, endDate, coverImageUrl, isFree, price,
           url, status, rsvps(count)
         )`
      )
      .eq("userId", user.id)
      .eq("status", "GOING")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // Reshape to match EventWithCounts format
    const events = (data ?? [])
      .filter((r: any) => r.events)
      .map((r: any) => ({
        ...r.events,
        _count: {
          rsvps: r.events.rsvps?.[0]?.count ?? 0,
        },
      }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch attending events:", error);
    return NextResponse.json(
      { error: "Failed to fetch attending events" },
      { status: 500 }
    );
  }
}
