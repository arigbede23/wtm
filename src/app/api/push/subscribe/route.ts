// Push Subscribe API — save or remove push notification subscriptions.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, p256dh, auth } = body;

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "endpoint, p256dh, and auth are required" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        userId: user.id,
        endpoint,
        p256dh,
        auth,
      },
      { onConflict: "userId,endpoint" }
    );

    if (error) throw error;

    return NextResponse.json({ subscribed: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint) {
    return NextResponse.json(
      { error: "endpoint is required" },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("userId", user.id)
      .eq("endpoint", endpoint);

    if (error) throw error;

    return NextResponse.json({ unsubscribed: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    );
  }
}
