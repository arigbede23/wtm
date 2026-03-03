"use client";

import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-brand-600">wtm</span>
          <span className="text-gray-400">?</span>
        </h1>
        <button className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100">
          <Search className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
