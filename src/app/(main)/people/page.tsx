// People Page — discover and search for other users to follow.

"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/social/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";
import { useAuth } from "@/hooks/useAuth";

type SearchUser = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
  isCurrentUser?: boolean;
};

function PeopleContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/users/search?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — show all users
  useEffect(() => {
    fetchUsers("");
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchUsers]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Find People
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Search for friends and follow them to see their events
      </p>

      {/* Search bar */}
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <Users className="h-12 w-12 text-gray-300 dark:text-neutral-600" />
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
            {query ? "No users found" : "No users yet"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {query
              ? "Try a different search term"
              : "Be the first to invite your friends!"}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          {users.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-900"
            >
              <Link href={`/user/${person.id}`} className="shrink-0">
                <UserAvatar
                  src={person.avatarUrl}
                  name={person.displayName ?? person.username}
                  size="lg"
                />
              </Link>
              <Link
                href={`/user/${person.id}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-semibold text-gray-900 dark:text-white">
                  {person.displayName ?? person.username ?? "User"}
                </p>
                {person.username && (
                  <p className="truncate text-sm text-gray-500">
                    @{person.username}
                  </p>
                )}
                {person.bio && (
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {person.bio}
                  </p>
                )}
              </Link>
              {!person.isCurrentUser && (
                <div className="shrink-0">
                  <FollowButton targetUserId={person.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PeoplePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-400">Loading...</div>}>
      <PeopleContent />
    </Suspense>
  );
}
