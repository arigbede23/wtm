// Comment Pin API — toggle pin on a comment (organizer only).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const commentId = params.id;

  try {
    // Fetch comment with its event's organizerId
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("id, pinned, eventId, event:eventId(organizerId)")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify user is the event organizer
    const organizerId = (comment.event as any)?.organizerId;
    if (organizerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const newPinned = !comment.pinned;

    const { error: updateError } = await supabase
      .from("comments")
      .update({ pinned: newPinned })
      .eq("id", commentId);

    if (updateError) throw updateError;

    return NextResponse.json({ pinned: newPinned });
  } catch (error) {
    console.error("Comment pin error:", error);
    return NextResponse.json(
      { error: "Failed to toggle pin" },
      { status: 500 }
    );
  }
}
