// useAuth Hook — provides authentication state and actions to any component.
// Usage: const { user, loading, signIn, signUp, signOut } = useAuth();
// "use client" is required because hooks use browser-only React features.

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);     // Current logged-in user (or null)
  const [loading, setLoading] = useState(true);             // True while we're checking auth status
  const supabase = createClient();

  useEffect(() => {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  // Sign in with existing email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  // Sign out — clears the session cookie
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signUp, signIn, signOut };
}
