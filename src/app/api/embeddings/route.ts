// Embeddings API — generates and stores embeddings for events and users.
// Supports three actions:
//   - "backfill-events" — batch-generate for events missing embeddings (CRON_SECRET auth)
//   - "embed-event"     — single event embedding (auth required)
//   - "embed-user"      — generate embedding from user's interests (auth required)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import {
  generateEmbedding,
  buildEventEmbeddingText,
  buildUserInterestsText,
} from "@/lib/embeddings";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for backfill

function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === "backfill-events") {
    // Require CRON_SECRET for backfill
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch events that don't have embeddings yet
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, description, category")
      .is("embedding", null)
      .eq("status", "PUBLISHED")
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let embedded = 0;
    let failed = 0;

    for (const event of events ?? []) {
      const text = buildEventEmbeddingText(event);
      const embedding = await generateEmbedding(text);

      if (embedding) {
        const { error: updateError } = await supabase
          .from("events")
          .update({ embedding: JSON.stringify(embedding) })
          .eq("id", event.id);

        if (updateError) {
          failed++;
        } else {
          embedded++;
        }
      } else {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      total: events?.length ?? 0,
      embedded,
      failed,
    });
  }

  if (action === "embed-event") {
    const { eventId } = body;
    if (!eventId) {
      return NextResponse.json(
        { error: "eventId required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: event, error } = await supabase
      .from("events")
      .select("id, title, description, category")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const text = buildEventEmbeddingText(event);
    const embedding = await generateEmbedding(text);

    if (embedding) {
      await supabase
        .from("events")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", event.id);
    }

    return NextResponse.json({ success: true, hasEmbedding: !!embedding });
  }

  if (action === "embed-user") {
    const supabase = createAuthClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("interests")
      .eq("id", user.id)
      .single();

    const interests: string[] = profile?.interests ?? [];
    if (!interests.length) {
      return NextResponse.json({ success: true, hasEmbedding: false });
    }

    const text = buildUserInterestsText(interests);
    const embedding = await generateEmbedding(text);

    if (embedding) {
      const admin = getSupabaseAdmin();
      await admin
        .from("users")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true, hasEmbedding: !!embedding });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
