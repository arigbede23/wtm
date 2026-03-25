"use client";

import Link from "next/link";
import { MobileContainer } from "@/components/layout/MobileContainer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MobileContainer>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <p className="text-6xl">😵</p>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mt-2 text-gray-500">
          An unexpected error occurred.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => reset()}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
          <Link
            href="/feed"
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    </MobileContainer>
  );
}
