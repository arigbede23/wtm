// Login Page — email/password sign-in form.
// On success, redirects to the feed. On error, shows an error message.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter(); // For programmatic navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent the default form page reload
    setError("");
    setLoading(true);

    // Call Supabase sign in
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Success — go to the feed
      router.push("/feed");
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-brand-600">wtm</span>
          <span className="text-gray-400">?</span>
        </h1>
        <p className="mt-2 text-gray-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {/* Error message banner */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            placeholder="you@example.com"
          />
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            placeholder="Your password"
          />
        </div>

        {/* Submit button — disabled while loading to prevent double-clicks */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Link to sign up page */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
