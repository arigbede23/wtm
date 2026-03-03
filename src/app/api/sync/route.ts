// Sync API Route — imports events from Ticketmaster and Eventbrite.
// GET  /api/sync — called by Vercel Cron every 6 hours
// POST /api/sync — manual trigger
// Both require Authorization: Bearer <CRON_SECRET>

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchTicketmasterEvents } from "@/lib/sync/ticketmaster";
import { fetchEventbriteEvents } from "@/lib/sync/eventbrite";
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

async function handleSync() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY configuration" },
      { status: 500 }
    );
  }

  // Use service role client to bypass RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Fetch from both APIs in parallel
  const [tmEvents, ebEvents] = await Promise.all([
    fetchTicketmasterEvents(),
    fetchEventbriteEvents(),
  ]);

  const allEvents = [...tmEvents, ...ebEvents];
  let totalProcessed = 0;
  let errors = 0;

  // Batch upsert — 100 events per batch
  for (let i = 0; i < allEvents.length; i += BATCH_SIZE) {
    const batch = allEvents.slice(i, i + BATCH_SIZE);

    const { error } = await supabase.from("events").upsert(
      batch.map((ev: NormalizedEvent) => ({
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
      })),
      { onConflict: "source,externalId" }
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
    totalProcessed,
    cleaned,
    errors,
  };

  console.log("[Sync] Complete:", summary);
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
