// Events API Route — serves event data at GET /api/events.
// This is a Next.js Route Handler (like an Express endpoint).
// The frontend's EventList component calls this to get events.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// "force-dynamic" tells Next.js to always run this on the server, never cache statically.
// We need this because the data changes (new events, RSVPs, etc.).
export const dynamic = "force-dynamic";

export async function GET() {
  // Create the Supabase client inside the function (not at module level)
  // so it only runs at request time, not during the build step.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Query events from Supabase:
    // - Select all event fields plus a count of RSVPs
    // - Only published events
    // - Only events that haven't happened yet
    // - Sorted by start date (soonest first)
    const { data: events, error } = await supabase
      .from("events")
      .select("*, rsvps(count)")
      .eq("status", "PUBLISHED")
      .gte("startDate", new Date().toISOString())
      .order("startDate", { ascending: true });

    if (error) throw error;

    // Reshape the data to match the EventWithCounts type.
    // Supabase returns rsvps as [{count: N}], but our frontend expects _count.rsvps.
    const shaped = (events ?? []).map((e: any) => ({
      ...e,
      _count: {
        rsvps: e.rsvps?.[0]?.count ?? 0,
      },
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
