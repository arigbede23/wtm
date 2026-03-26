// Story API Route — delete a story.
// DELETE: remove own story

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
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

    // Fetch story to verify ownership
    const { data: story, error: fetchError } = await supabase
      .from("stories")
      .select("userId")
      .eq("id", params.id)
      .single();

    if (fetchError || !story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    if (story.userId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Story delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Story DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
