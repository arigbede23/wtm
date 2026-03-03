// Profile Page — shows the user's account info or a sign-in prompt.
// Uses the useAuth hook to check if someone is logged in.

"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();

  // Show a spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  // Not logged in — show sign-in prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl dark:bg-gray-800">
          👤
        </div>
        <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100">
          Not signed in
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to save events and RSVP
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </div>
    );
  }

  // Logged in — show profile info and sign out button
  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center">
        {/* Avatar circle with the first letter of their email */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {user.email?.[0].toUpperCase()}
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
          {user.email}
        </h2>
        <p className="text-sm text-gray-500">
          Member since {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-8">
        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
