// Events API Route — serves event data at GET /api/events.
// Supports filtering by category, search, location/distance, price, date range, and organizerId.
// POST creates a new event (requires auth).

import { NextRequest, NextResponse } from "next/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Haversine formula — calculates distance in miles between two lat/lng points
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
    let query = supabase
      .from("events")
      .select("*, rsvps(count)")
      .eq("status", "PUBLISHED")
      .order("startDate", { ascending: true });

    // Only filter by future dates when not fetching organizer's events
    if (!organizerId) {
      query = query.gte("startDate", new Date().toISOString());
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
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
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

    // Location-based distance filtering (done in JS after Supabase query)
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const maxRadius = radius ? parseFloat(radius) : null;

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

      // Filter by radius if specified
      if (maxRadius != null) {
        shaped = shaped.filter(
          (event: any) => event.distance != null && event.distance <= maxRadius
        );
      }

      // Sort by distance when location is provided
      shaped.sort((a: any, b: any) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
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

  try {
    const { data, error } = await supabase
      .from("events")
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
