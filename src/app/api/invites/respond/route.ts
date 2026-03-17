// Invite Respond API — accept or decline an event invite.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { inviteId, response } = body;

  if (!inviteId || !response) {
    return NextResponse.json(
      { error: "inviteId and response are required" },
      { status: 400 }
    );
  }

  if (!["ACCEPTED", "DECLINED"].includes(response)) {
    return NextResponse.json(
      { error: "response must be ACCEPTED or DECLINED" },
      { status: 400 }
    );
  }

  try {
    // Fetch invite and verify recipient
    const { data: invite, error: fetchError } = await supabase
      .from("invites")
      .select("id, eventId, recipientId, status")
      .eq("id", inviteId)
      .single();

    if (fetchError || !invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.recipientId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Update invite status
    const { error: updateError } = await supabase
      .from("invites")
      .update({ status: response })
      .eq("id", inviteId);

    if (updateError) throw updateError;

    // If accepted, auto-upsert RSVP as GOING
    if (response === "ACCEPTED") {
      await supabase
        .from("rsvps")
        .upsert(
          {
            userId: user.id,
            eventId: invite.eventId,
            status: "GOING",
            updatedAt: new Date().toISOString(),
          },
          { onConflict: "userId,eventId" }
        );
    }

    return NextResponse.json({ status: response });
  } catch (error) {
    console.error("Invite respond error:", error);
    return NextResponse.json(
      { error: "Failed to respond to invite" },
      { status: 500 }
    );
  }
}
