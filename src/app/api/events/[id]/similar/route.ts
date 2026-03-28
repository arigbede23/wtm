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

  // Fetch the source event with its embedding, category, and location
  const { data: event, error } = await supabase
    .from("events")
    .select("id, category, embedding, lat, lng")
    .eq("id", params.id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Build a bounding box around the source event (100 mi)
  const RADIUS = 100;
  const hasLocation = event.lat != null && event.lng != null;
  const latDelta = hasLocation ? RADIUS / 69 : null;
  const lngDelta =
    hasLocation
      ? RADIUS / (69 * Math.cos((event.lat * Math.PI) / 180))
      : null;

  // Strategy 1: pgvector similarity
  if (event.embedding) {
    const { data: matches, error: rpcError } = await supabase.rpc(
      "match_similar_events",
      {
        event_id: event.id,
        query_embedding: event.embedding,
        match_count: 20,
        match_threshold: 0.3,
      }
    );

    if (!rpcError && matches && matches.length > 0) {
      const eventIds = matches.map((m: { id: string }) => m.id);

      let query = supabase
        .from("events")
        .select("*, rsvps(count)")
        .in("id", eventIds)
        .eq("status", "PUBLISHED")
        .gte("startDate", new Date().toISOString());

      // Filter to nearby events
      if (hasLocation && latDelta && lngDelta) {
        query = query
          .gte("lat", event.lat - latDelta)
          .lte("lat", event.lat + latDelta)
          .gte("lng", event.lng - lngDelta)
          .lte("lng", event.lng + lngDelta);
      }

      const { data: events } = await query;

      const shaped = (events ?? []).map((e: any) => ({
        ...e,
        _count: { rsvps: e.rsvps?.[0]?.count ?? 0 },
      }));

      // Preserve similarity ordering, cap at 6
      const orderMap = new Map<string, number>(eventIds.map((id: string, i: number) => [id, i]));
      shaped.sort(
        (a: any, b: any) =>
          (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
      );

      return NextResponse.json(shaped.slice(0, 6));
    }
  }

  // Strategy 2: same-category fallback with location filter
  let fallbackQuery = supabase
    .from("events")
    .select("*, rsvps(count)")
    .eq("category", event.category)
    .eq("status", "PUBLISHED")
    .neq("id", event.id)
    .gte("startDate", new Date().toISOString())
    .order("startDate", { ascending: true })
    .limit(6);

  if (hasLocation && latDelta && lngDelta) {
    fallbackQuery = fallbackQuery
      .gte("lat", event.lat - latDelta)
      .lte("lat", event.lat + latDelta)
      .gte("lng", event.lng - lngDelta)
      .lte("lng", event.lng + lngDelta);
  }

  const { data: fallback } = await fallbackQuery;

  const shaped = (fallback ?? []).map((e: any) => ({
    ...e,
    _count: { rsvps: e.rsvps?.[0]?.count ?? 0 },
  }));

  return NextResponse.json(shaped);
}
