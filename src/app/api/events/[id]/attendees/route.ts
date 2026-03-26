// Attendees API Route — list of users who RSVP'd GOING or INTERESTED to an event.
// GET: returns attendee list with avatar, displayName, username, and rsvp status

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    // Fetch RSVPs with GOING or INTERESTED status, join user data
    const { data: rsvps, error } = await supabase
      .from("rsvps")
      .select("userId, status, users:userId(id, displayName, username, avatarUrl)")
      .eq("eventId", params.id)
      .in("status", ["GOING", "INTERESTED"])
      .limit(100);

    if (error) throw error;

    // Extract user objects from the join, include rsvp status
    const attendees = (rsvps ?? []).map((rsvp: any) => ({
      id: rsvp.users?.id ?? rsvp.userId,
      displayName: rsvp.users?.displayName ?? null,
      username: rsvp.users?.username ?? null,
      avatarUrl: rsvp.users?.avatarUrl ?? null,
      status: rsvp.status as "GOING" | "INTERESTED",
    }));

    return NextResponse.json(attendees);
  } catch (error) {
    console.error("Attendees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}
