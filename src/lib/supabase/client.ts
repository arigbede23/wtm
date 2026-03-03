// Supabase Browser Client
// Use this in "use client" components (anything that runs in the browser).
// It reads auth cookies from the browser automatically.
// Docs: https://supabase.com/docs/guides/auth/server-side/nextjs

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // NEXT_PUBLIC_ env vars are safe to use in the browser — they're not secret.
  // The anon key only allows operations that RLS (Row Level Security) permits.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(url, key);
}
