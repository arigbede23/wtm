// useAuth Hook — provides authentication state and actions to any component.
// Usage: const { user, loading, signIn, signUp, signOut } = useAuth();
// "use client" is required because hooks use browser-only React features.

"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);     // Current logged-in user (or null)
  const [loading, setLoading] = useState(true);             // True while we're checking auth status
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // Lazily create the Supabase client only in the browser to avoid
  // @supabase/ssr throwing during Next.js static prerendering.
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  useEffect(() => {
    const supabase = getSupabase();

    // On mount, check if there's already a logged-in user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes (login, logout, token refresh).
    // This keeps the user state in sync across tabs.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup: unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password — creates a new account
  const signUp = async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signUp({
      email,
      password,
    });
    return { error };
  };

  // Sign in with existing email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Sign in with OAuth provider (Google, Apple, or Facebook/Instagram)
  const signInWithOAuth = async (
    provider: "google" | "apple" | "facebook"
  ) => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  // Sign out — clears the session cookie
  const signOut = async () => {
    await getSupabase().auth.signOut();
  };

  return { user, loading, signUp, signIn, signInWithOAuth, signOut };
}
