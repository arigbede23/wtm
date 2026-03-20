// 404 Not Found Page — shown when a user visits a URL that doesn't exist.
// Also shown when notFound() is called (e.g. invalid event ID).

import Link from "next/link";
import { MobileContainer } from "@/components/layout/MobileContainer";

export default function NotFound() {
  return (
    <MobileContainer>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <p className="text-6xl">🤷</p>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Page not found
        </h2>
        <p className="mt-2 text-gray-500">
          This page doesn&apos;t exist or was removed.
        </p>
        <Link
          href="/feed"
          className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Back to Feed
        </Link>
      </div>
    </MobileContainer>
  );
}
