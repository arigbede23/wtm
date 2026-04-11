// Event Preview API — lightweight endpoint for link preview cards.
// Returns only the fields needed to render an inline preview.

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

  const { data: event, error } = await supabase
    .from("events")
    .select("id, title, coverImageUrl, startDate, category, address, city, state, isFree, price")
    .eq("id", params.id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
  });
}
