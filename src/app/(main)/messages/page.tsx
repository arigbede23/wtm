// Messages Inbox — lists all conversations for the current user.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ConversationItem } from "@/components/messages/ConversationItem";
import type { Conversation } from "@/components/messages/ConversationItem";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch("/api/conversations")
      .then(async (res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response shape");
        setConversations(data);
      })
      .catch((err) => {
        setError(err?.message ?? "Could not load messages");
      })
      .finally(() => setLoading(false));
  }, [user, reloadToken]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-300" />
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          Messages
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to see your messages
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        Messages
      </h2>

      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl p-3"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                <div className="h-2 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
              </div>
              <div className="h-2 w-8 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 dark:text-neutral-600" />
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
            Could not load messages
          </p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => setReloadToken((t) => t + 1)}
            className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try Again
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 dark:text-neutral-600" />
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
            No messages yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Follow someone and start a conversation from their profile.
          </p>
          <Link
            href="/people"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Find people
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-1">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
