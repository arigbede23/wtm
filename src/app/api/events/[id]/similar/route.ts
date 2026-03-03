// Similar Events API — returns events similar to a given event.
// Strategy 1: pgvector similarity from the event's own embedding
// Strategy 2: same-category fallback

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch the source event with its embedding and category
  const { data: event, error } = await supabase
    .from("events")
    .select("id, category, embedding")
    .eq("id", params.id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Strategy 1: pgvector similarity
  if (event.embedding) {
    const { data: matches, error: rpcError } = await supabase.rpc(
      "match_similar_events",
      {
        event_id: event.id,
        query_embedding: event.embedding,
        match_count: 6,
        match_threshold: 0.3,
      }
    );

    if (!rpcError && matches && matches.length > 0) {
      const eventIds = matches.map((m: { id: string }) => m.id);

      const { data: events } = await supabase
        .from("events")
        .select("*, rsvps(count)")
        .in("id", eventIds)
        .eq("status", "PUBLISHED")
        .gte("startDate", new Date().toISOString());

      const shaped = (events ?? []).map((e: any) => ({
        ...e,
        _count: { rsvps: e.rsvps?.[0]?.count ?? 0 },
      }));

      // Preserve similarity ordering
      const orderMap = new Map<string, number>(eventIds.map((id: string, i: number) => [id, i]));
      shaped.sort(
        (a: any, b: any) =>
          (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
      );

      return NextResponse.json(shaped);
    }
  }

  // Strategy 2: same-category fallback
  const { data: fallback } = await supabase
    .from("events")
    .select("*, rsvps(count)")
    .eq("category", event.category)
    .eq("status", "PUBLISHED")
    .neq("id", event.id)
    .gte("startDate", new Date().toISOString())
    .order("startDate", { ascending: true })
    .limit(6);

  const shaped = (fallback ?? []).map((e: any) => ({
    ...e,
    _count: { rsvps: e.rsvps?.[0]?.count ?? 0 },
  }));

  return NextResponse.json(shaped);
}
