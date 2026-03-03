// Header — sticky top bar with the app logo and expandable search.
// Search submits as a URL param and navigates to /feed?search=...

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { NotificationBell } from "@/components/social/NotificationBell";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/feed?search=${encodeURIComponent(trimmed)}`);
      setIsSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchValue("");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        {isSearchOpen ? (
          // Expanded search input
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search events..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <>
            {/* App logo / title */}
            <h1 className="text-2xl font-extrabold tracking-tighter">
              <span className="text-gray-900 dark:text-white">wtm</span>
              <span className="text-brand-600">?</span>
            </h1>
            {/* Search + Notification buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              >
                <Search className="h-5 w-5" />
              </button>
              <NotificationBell />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
