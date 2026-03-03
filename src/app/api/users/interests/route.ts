// User Interests API — GET and POST interests for the authenticated user.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("interests")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ interests: [] });
  }

  return NextResponse.json({ interests: data.interests ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const interests: string[] = body.interests;

  if (!Array.isArray(interests)) {
    return NextResponse.json(
      { error: "interests must be an array" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("users")
    .update({ interests })
    .eq("id", user.id);

  if (error) {
    console.error("[Interests] Failed to save:", error);
    return NextResponse.json(
      { error: "Failed to save interests" },
      { status: 500 }
    );
  }

  return NextResponse.json({ interests });
}
