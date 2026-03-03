// OAuth Callback Route — exchanges the authorization code for a session.
// After OAuth provider redirects back, this route finalizes the login
// and sends the user to onboarding (new) or feed (returning).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    // No code = something went wrong with OAuth
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[OAuth Callback] Code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  // Check if user has interests set (empty = new user → onboarding)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("interests")
      .eq("id", user.id)
      .single();

    const hasInterests =
      profile?.interests && profile.interests.length > 0;

    return NextResponse.redirect(
      `${origin}${hasInterests ? "/feed" : "/onboarding"}`
    );
  }

  return NextResponse.redirect(`${origin}/feed`);
}
