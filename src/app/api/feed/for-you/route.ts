// For You Feed API — returns personalized event recommendations.
// Strategy 1: pgvector similarity (user has embedding + events have embeddings)
// Strategy 2: category fallback (user has interests but no embedding)
// Strategy 3: empty array (no interests — UI prompts user to set them)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { haversineDistance } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
  const maxRadius = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch user profile with interests and embedding
  const { data: profile } = await supabase
    .from("users")
    .select("interests, embedding")
    .eq("id", user.id)
    .single();

  const interests: string[] = profile?.interests ?? [];
  const hasEmbedding = !!profile?.embedding;

  // Strategy 3: no interests at all
  if (interests.length === 0) {
    return NextResponse.json({ events: [], strategy: "none" });
  }

  const anonClient = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Strategy 1: pgvector similarity search
  if (hasEmbedding) {
    const { data: matches, error: rpcError } = await anonClient.rpc(
      "match_events_for_user",
      {
        query_embedding: profile!.embedding,
        match_count: 20,
        match_threshold: 0.3,
      }
    );

    if (!rpcError && matches && matches.length > 0) {
      const eventIds = matches.map((m: { id: string }) => m.id);

      const { data: events } = await anonClient
        .from("events")
        .select("*, rsvps(count)")
        .in("id", eventIds)
        .eq("status", "PUBLISHED")
        .gte("startDate", new Date().toISOString());

      let shaped = (events ?? []).map((e: any) => ({
        ...e,
        _count: { rsvps: e.rsvps?.[0]?.count ?? 0 },
      }));

      // Filter by location radius
      if (userLat != null && userLng != null) {
        shaped = shaped.filter((e: any) => {
          if (e.lat == null || e.lng == null) return false;
          const dist = haversineDistance(userLat, userLng, e.lat, e.lng);
          return maxRadius == null || dist <= maxRadius;
        });
      }

      // Preserve similarity ordering
      const orderMap = new Map<string, number>(eventIds.map((id: string, i: number) => [id, i]));
      shaped.sort(
        (a: any, b: any) =>
          (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99)
      );

      return NextResponse.json({ events: shaped, strategy: "embeddings" });
    }
  }

  // Strategy 2: category-based fallback
  const { data: events } = await anonClient
    .from("events")
    .select("*, rsvps(count)")
    .in("category", interests)
    .eq("status", "PUBLISHED")
    .gte("startDate", new Date().toISOString())
    .order("startDate", { ascending: true })
    .limit(20);

  let shaped = (events ?? []).map((e: any) => ({
    ...e,
    _count: { rsvps: e.rsvps?.[0]?.count ?? 0 },
  }));

  // Filter by location radius
  if (userLat != null && userLng != null) {
    shaped = shaped.filter((e: any) => {
      if (e.lat == null || e.lng == null) return false;
      const dist = haversineDistance(userLat, userLng, e.lat, e.lng);
      return maxRadius == null || dist <= maxRadius;
    });
  }

  return NextResponse.json({ events: shaped, strategy: "categories" });
}
