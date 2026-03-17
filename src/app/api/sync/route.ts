// Sync API Route — imports events from Ticketmaster and Eventbrite.
// GET  /api/sync — called by Vercel Cron every 6 hours
// POST /api/sync — manual trigger
// Both require Authorization: Bearer <CRON_SECRET>
// Uses Supabase REST API (HTTP) for database writes.

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { fetchTicketmasterEvents } from "@/lib/sync/ticketmaster";
import { fetchEventbriteEvents } from "@/lib/sync/eventbrite";
import { fetchInstagramEvents } from "@/lib/sync/instagram";
import type { NormalizedEvent } from "@/lib/sync/normalize";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

const BATCH_SIZE = 100;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Use service role key if available, otherwise fall back to anon key
  // (anon key requires an RLS policy allowing sync inserts)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

async function handleSync() {
  const supabase = getSupabaseClient();

  // Look up distinct cities where users have RSVP'd or created events recently
  // so we sync content for areas with actual active users.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: activeEvents } = await supabase
    .from("events")
    .select("city, lat, lng")
    .eq("source", "USER")
    .gte("startDate", thirtyDaysAgo)
    .not("city", "is", null)
    .not("lat", "is", null);

  // De-duplicate cities and collect one coordinate per city
  const cityMap = new Map<string, { lat: string; lng: string }>();
  for (const ev of activeEvents ?? []) {
    if (ev.city && ev.lat != null && ev.lng != null && !cityMap.has(ev.city)) {
      cityMap.set(ev.city, { lat: String(ev.lat), lng: String(ev.lng) });
    }
  }
  const activeCities = Array.from(cityMap.keys());
  const cityCoords = Array.from(cityMap.values());

  // Fetch Ticketmaster events for each active city + Instagram for those cities
  const tmPromises = cityCoords.map((c) =>
    fetchTicketmasterEvents(c.lat, c.lng)
  );
  const [tmResults, ebEvents, igEvents] = await Promise.all([
    Promise.all(tmPromises),
    fetchEventbriteEvents(),
    fetchInstagramEvents(activeCities.length > 0 ? activeCities : undefined),
  ]);
  const tmEvents = tmResults.flat();

  const allEvents = [...tmEvents, ...ebEvents, ...igEvents];
  let totalProcessed = 0;
  let errors = 0;

  // Batch upsert — 100 events per batch
  for (let i = 0; i < allEvents.length; i += BATCH_SIZE) {
    const batch = allEvents.slice(i, i + BATCH_SIZE);

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

    if (error) {
      console.error(`[Sync] Upsert batch ${i} error:`, error);
      errors++;
    } else {
      totalProcessed += batch.length;
    }
  }

  // Clean up past imported events (not user-created)
  let cleaned = 0;
  const { data: deletedData, error: cleanError } = await supabase
    .from("events")
    .delete()
    .neq("source", "USER")
    .lt("startDate", new Date().toISOString())
    .select("id");

  if (cleanError) {
    console.error("[Sync] Cleanup error:", cleanError);
  } else {
    cleaned = deletedData?.length ?? 0;
  }

  const summary = {
    success: errors === 0,
    ticketmaster: tmEvents.length,
    eventbrite: ebEvents.length,
    instagram: igEvents.length,
    totalProcessed,
    cleaned,
    errors,
  };

  console.log("[Sync] Complete:", summary);

  // Fire-and-forget: backfill embeddings for newly synced events
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
      : "http://localhost:3000";
    fetch(`${baseUrl}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({ action: "backfill-events" }),
    }).catch(() => {});
  }

  return NextResponse.json(summary);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleSync();
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleSync();
}
