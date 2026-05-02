// Header — sticky top bar with the app logo and expandable search.
// Search shows live results for both events and people.

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, X, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { NotificationBell } from "@/components/social/NotificationBell";
import { MessageBadge } from "@/components/messages/MessageBadge";
import { useLocalTeamContext } from "@/components/layout/LocalTeamProvider";
import { getTeamLogoUrl } from "@/lib/localTeams";
import { UserAvatar } from "@/components/social/UserAvatar";

type SearchPerson = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

type SearchEvent = {
  id: string;
  title: string;
  category: string;
  startDate: string;
};

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [people, setPeople] = useState<SearchPerson[]>([]);
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const team = useLocalTeamContext();

  useEffect(() => setMounted(true), []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Live search as user types
  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setPeople([]);
      setEvents([]);
      return;
    }
    setSearching(true);
    try {
      const [peopleRes, eventsRes] = await Promise.all([
        fetch(`/api/users/search?q=${encodeURIComponent(query)}`),
        fetch(`/api/events?search=${encodeURIComponent(query)}`),
      ]);
      const [peopleData, eventsData] = await Promise.all([
        peopleRes.json(),
        eventsRes.json(),
      ]);
      if (Array.isArray(peopleData)) setPeople(peopleData.slice(0, 5));
      if (Array.isArray(eventsData)) setEvents(eventsData.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(searchValue), 250);
    return () => clearTimeout(timer);
  }, [searchValue, fetchResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      router.push(`/feed?search=${encodeURIComponent(trimmed)}`);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchValue("");
    setPeople([]);
    setEvents([]);
  };

  const handleResultClick = () => {
    handleClose();
  };

  const hasResults = people.length > 0 || events.length > 0;
  const showDropdown = isSearchOpen && searchValue.trim().length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        {isSearchOpen ? (
          <div ref={containerRef} className="relative flex-1">
            {/* Search input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search events and people..."
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
              />
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            {/* Live results dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                {/* People results */}
                {people.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      People
                    </p>
                    {people.map((person) => (
                      <Link
                        key={person.id}
                        href={`/user/${person.id}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        <UserAvatar
                          src={person.avatarUrl}
                          name={person.displayName ?? person.username}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {person.displayName ?? person.username ?? "User"}
                          </p>
                          {person.username && (
                            <p className="truncate text-xs text-gray-500">
                              @{person.username}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/people?q=${encodeURIComponent(searchValue)}`}
                      onClick={handleResultClick}
                      className="block border-t border-gray-100 px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                    >
                      View all people results
                    </Link>
                  </div>
                )}

                {/* Event results */}
                {events.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Events
                    </p>
                    {events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/event/${event.id}`}
                        onClick={handleResultClick}
                        className="block px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {event.category.charAt(0) + event.category.slice(1).toLowerCase()}
                        </p>
                      </Link>
                    ))}
                    <Link
                      href={`/feed?search=${encodeURIComponent(searchValue)}`}
                      onClick={handleResultClick}
                      className="block border-t border-gray-100 px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                    >
                      View all event results
                    </Link>
                  </div>
                )}

                {/* No results */}
                {!searching && !hasResults && (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    No results found
                  </p>
                )}

                {/* Loading */}
                {searching && !hasResults && (
                  <div className="flex items-center justify-center px-4 py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* App logo / title + team branding */}
            <Link href="/feed" className="flex items-center gap-2">
              {team && (
                <Image
                  src={getTeamLogoUrl(team)}
                  alt={`${team.city} ${team.team} logo`}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                  unoptimized
                  priority
                />
              )}
              <div className="flex flex-col">
                <h1 className="text-2xl font-extrabold tracking-tighter leading-none">
                  <span className="text-gray-900 dark:text-white">wtm</span>
                  <span className="text-brand-600">?</span>
                </h1>
                {team && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                    Home of the {team.team}
                  </p>
                )}
              </div>
            </Link>
            {/* Search + Theme toggle + Notification buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <Search className="h-5 w-5" />
              </button>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
              <MessageBadge />
              <NotificationBell />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
