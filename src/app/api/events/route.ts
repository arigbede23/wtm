// Events API Route — serves event data at GET /api/events.
// Supports filtering by category, search, location/distance, price, date range, and organizerId.
// POST creates a new event (requires auth).

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { haversineDistance } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Parse query params
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");
  const isFree = searchParams.get("isFree");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const organizerId = searchParams.get("organizerId");

  try {
    // Build Supabase query with filters
    // Pre-compute a lat/lng bounding box so the DB only returns nearby events.
    // 1 degree of latitude ≈ 69 miles; longitude varies by latitude.
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const maxRadius = radius ? parseFloat(radius) : null;

    let query = supabase
      .from("events")
      .select("*, rsvps(count)")
      .eq("status", "PUBLISHED")
      .order("startDate", { ascending: true })
      .limit(2000);

    // Only filter by future dates when not fetching organizer's events
    if (!organizerId) {
      query = query.gte("startDate", new Date().toISOString());
    }

    // Bounding box filter — narrow rows at the DB level before JS distance calc.
    // Use .or() so user-created events without coordinates are still included.
    if (userLat != null && userLng != null && maxRadius != null) {
      const latDelta = maxRadius / 69;
      const lngDelta = maxRadius / (69 * Math.cos((userLat * Math.PI) / 180));
      query = query.or(
        `and(lat.gte.${userLat - latDelta},lat.lte.${userLat + latDelta},lng.gte.${userLng - lngDelta},lng.lte.${userLng + lngDelta}),lat.is.null`
      );
    }

    // Organizer filter (for "My Events" on profile)
    if (organizerId) {
      query = query.eq("organizerId", organizerId);
    }

    // Category filter
    if (category) {
      query = query.eq("category", category);
    }

    // Free events filter
    if (isFree === "true") {
      query = query.eq("isFree", true);
    }

    // Date range filters
    if (dateFrom) {
      query = query.gte("startDate", dateFrom);
    }
    if (dateTo) {
      query = query.lte("startDate", dateTo);
    }

    // Text search — matches title or description
    // Escape LIKE special characters to prevent wildcard injection
    if (search) {
      const escaped = search.replace(/[%_\\]/g, (ch) => `\\${ch}`);
      query = query.or(
        `title.ilike.%${escaped}%,description.ilike.%${escaped}%`
      );
    }

    const { data: events, error } = await query;

    if (error) throw error;

    // Reshape RSVP counts
    let shaped = (events ?? []).map((e: any) => ({
      ...e,
      _count: {
        rsvps: e.rsvps?.[0]?.count ?? 0,
      },
    }));

    // Location-based distance filtering (precise haversine after DB bounding box)
    if (userLat != null && userLng != null) {
      // Attach distance to each event that has coordinates
      shaped = shaped.map((event: any) => {
        if (event.lat != null && event.lng != null) {
          return {
            ...event,
            distance: Math.round(
              haversineDistance(userLat, userLng, event.lat, event.lng) * 10
            ) / 10,
          };
        }
        return event;
      });

      // When searching, skip radius filtering and distance-based sorting —
      // just return search matches in chronological order (already sorted by startDate).
      if (!search) {
        // Filter out imported events without coordinates (can't distance-rank them
        // and they may be from an unrelated region). Keep user-created events
        // without coordinates so they always appear in the feed.
        shaped = shaped.filter(
          (event: any) =>
            event.source === "USER" ||
            (event.distance != null &&
              (maxRadius == null || event.distance <= maxRadius))
        );

        // Combined sort: closer + sooner events rank higher.
        // Normalize distance (0–50 mi → 0–1) and days away (0–30 → 0–1),
        // then blend them equally. Events without coordinates sink to the end.
        const now = Date.now();
        shaped.sort((a: any, b: any) => {
          const aHas = a.distance != null ? 0 : 1;
          const bHas = b.distance != null ? 0 : 1;
          if (aHas !== bHas) return aHas - bHas;

          const aDist = (a.distance ?? 50) / 50;
          const bDist = (b.distance ?? 50) / 50;
          const aDays = Math.min(Math.max((new Date(a.startDate).getTime() - now) / (30 * 86400000), 0), 1);
          const bDays = Math.min(Math.max((new Date(b.startDate).getTime() - now) / (30 * 86400000), 0), 1);

          return (aDist + aDays) - (bDist + bDays);
        });

        // Category interleaving: when two adjacent events share the same
        // category, swap the second one with the next different-category event.
        for (let i = 0; i < shaped.length - 1; i++) {
          if (shaped[i].category === shaped[i + 1].category) {
            const swapIdx = shaped.findIndex(
              (e: any, j: number) => j > i + 1 && e.category !== shaped[i].category
            );
            if (swapIdx !== -1) {
              const temp = shaped[i + 1];
              shaped[i + 1] = shaped[swapIdx];
              shaped[swapIdx] = temp;
            }
          }
        }
      }
    }

    // Attach friendsGoing if user is authenticated
    try {
      const authSupabase = createClient();
      const {
        data: { user },
      } = await authSupabase.auth.getUser();

      if (user && shaped.length > 0) {
        // Get user's following list
        const { data: follows } = await authSupabase
          .from("follows")
          .select("followingId")
          .eq("followerId", user.id);

        const followingIds = (follows ?? []).map((f: any) => f.followingId);

        if (followingIds.length > 0) {
          const eventIds = shaped.map((e: any) => e.id);

          // Get RSVPs from friends for these events
          const { data: friendRsvps } = await authSupabase
            .from("rsvps")
            .select("eventId, userId, user:userId(id, displayName, username, avatarUrl)")
            .in("userId", followingIds)
            .in("eventId", eventIds)
            .eq("status", "GOING");

          // Group by event
          const friendsByEvent: Record<string, any[]> = {};
          for (const rsvp of friendRsvps ?? []) {
            if (!friendsByEvent[rsvp.eventId]) {
              friendsByEvent[rsvp.eventId] = [];
            }
            friendsByEvent[rsvp.eventId].push(rsvp.user);
          }

          shaped = shaped.map((event: any) => ({
            ...event,
            friendsGoing: friendsByEvent[event.id] ?? [],
          }));
        }
      }
    } catch {
      // Non-critical — just skip friendsGoing
    }

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  // Validate required fields
  const { title, category, startDate } = body;
  if (!title || !category || !startDate) {
    return NextResponse.json(
      { error: "title, category, and startDate are required" },
      { status: 400 }
    );
  }

  const validCategories = [
    "MUSIC", "SPORTS", "ARTS", "FOOD", "TECH", "SOCIAL",
    "COMEDY", "WELLNESS", "OUTDOORS", "NIGHTLIFE", "COMMUNITY", "OTHER",
  ];
  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  // Validate price (if provided non-null, must be finite, non-negative number)
  if (body.price !== undefined && body.price !== null) {
    const p = body.price;
    if (typeof p !== "number" || !Number.isFinite(p) || p < 0) {
      return NextResponse.json(
        { error: "price must be a non-negative number" },
        { status: 400 }
      );
    }
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .insert({
        id: randomUUID(),
        title,
        description: body.description || null,
        category,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        startDate,
        endDate: body.endDate || null,
        coverImageUrl: body.coverImageUrl || null,
        isFree: body.isFree ?? true,
        price: body.price ?? null,
        url: body.url || null,
        organizerId: user.id,
        source: "USER",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Fire-and-forget: generate embedding for the new event
    if (data?.id) {
      const baseUrl = request.nextUrl.origin;
      fetch(`${baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "embed-event", eventId: data.id }),
      }).catch(() => {});
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
