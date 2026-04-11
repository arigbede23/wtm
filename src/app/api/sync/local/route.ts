// Local Sync API — fetches Ticketmaster events near the user's location.
// POST /api/sync/local  { lat, lng }
// No auth required — rate-limited by a per-location cooldown in memory.

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { fetchTicketmasterEvents } from "@/lib/sync/ticketmaster";
import type { NormalizedEvent } from "@/lib/sync/normalize";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 100;
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes per location bucket

// In-memory cooldown map: "lat,lng" rounded to 1 decimal → last sync timestamp
const recentSyncs = new Map<string, number>();

function bucketKey(lat: number, lng: number): string {
  return `${lat.toFixed(1)},${lng.toFixed(1)}`;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lat = parseFloat(body.lat);
  const lng = parseFloat(body.lng);

  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "lat must be -90..90 and lng must be -180..180" },
      { status: 400 }
    );
  }

  // Check cooldown — skip if we recently synced this area
  const key = bucketKey(lat, lng);
  const lastSync = recentSyncs.get(key);
  if (lastSync && Date.now() - lastSync < COOLDOWN_MS) {
    return NextResponse.json({ skipped: true, reason: "recently synced" });
  }

  recentSyncs.set(key, Date.now());

  const supabase = getSupabaseClient();
  const events = await fetchTicketmasterEvents(String(lat), String(lng));

  if (events.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  let totalProcessed = 0;

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const now = new Date().toISOString();

    const { error } = await supabase.from("events").upsert(
      batch.map((ev: NormalizedEvent) => ({
        id: randomUUID(),
        source: ev.source,
        externalId: ev.externalId,
        title: ev.title,
        description: ev.description,
        category: ev.category,
        address: ev.address,
        city: ev.city,
        state: ev.state,
        lat: ev.lat,
        lng: ev.lng,
        startDate: ev.startDate,
        endDate: ev.endDate,
        coverImageUrl: ev.coverImageUrl,
        isFree: ev.isFree,
        price: ev.price,
        url: ev.url,
        status: ev.status,
        createdAt: now,
        updatedAt: now,
      })),
      { onConflict: "source,externalId", ignoreDuplicates: false }
    );

    if (!error) totalProcessed += batch.length;
  }

  return NextResponse.json({ synced: totalProcessed });
}
