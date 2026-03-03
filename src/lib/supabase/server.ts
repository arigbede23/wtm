// Supabase Server Client
// Use this in Server Components, Server Actions, and Route Handlers.
// It reads auth cookies from the request headers (not the browser).
// Docs: https://supabase.com/docs/guides/auth/server-side/nextjs

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, key, {
    cookies: {
      // These methods let Supabase read/write auth session cookies
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // set() fails in Server Components (read-only) — that's fine, we ignore it.
          // It works in Route Handlers and Server Actions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Same as above — safe to ignore in Server Components
        }
      },
    },
  });
}
