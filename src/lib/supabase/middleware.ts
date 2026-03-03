// Supabase Middleware Helper
// This runs on every request to keep the user's auth session fresh.
// Without this, the session cookie would expire and users would get logged out.
// Docs: https://supabase.com/docs/guides/auth/server-side/nextjs

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Start with a default "pass through" response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip if Supabase isn't configured yet (e.g. during first-time setup)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return response;
  }

  // Create a Supabase client that can read/write cookies on the request/response
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Update the cookie on both the request and response objects
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // This call refreshes the session if it's about to expire.
  // The refreshed token gets saved back to the cookie via set() above.
  await supabase.auth.getUser();

  return response;
}
