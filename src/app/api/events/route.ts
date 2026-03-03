import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*, rsvps(count)")
      .eq("status", "PUBLISHED")
      .gte("startDate", new Date().toISOString())
      .order("startDate", { ascending: true });

    if (error) throw error;

    // Reshape to match the expected format
    const shaped = (events ?? []).map((e: any) => ({
      ...e,
      _count: {
        rsvps: e.rsvps?.[0]?.count ?? 0,
      },
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
