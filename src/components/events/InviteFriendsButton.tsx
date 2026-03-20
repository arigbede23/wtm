// InviteFriendsButton — opens a modal to invite friends to an event.

"use client";

import { useState, useEffect } from "react";
import { Send, X, Check, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/social/UserAvatar";

type Friend = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

type InviteFriendsButtonProps = {
  eventId: string;
};

export function InviteFriendsButton({ eventId }: InviteFriendsButtonProps) {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [alreadyInvited, setAlreadyInvited] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setSent(false);
    setSelected(new Set());

    // Fetch following list and existing invites in parallel
    Promise.all([
      fetch("/api/follow?list=following").then((r) => r.json()),
      fetch(`/api/events/${eventId}/invites`).then((r) => r.json()),
    ])
      .then(([followData, inviteData]) => {
        if (Array.isArray(followData.following)) {
          setFriends(followData.following);
        }
        if (Array.isArray(inviteData)) {
          setAlreadyInvited(
            new Set(inviteData.map((i: any) => i.recipient?.id).filter(Boolean))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, eventId]);

  function toggleFriend(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (selected.size === 0) return;
    setSending(true);

    try {
      await fetch(`/api/events/${eventId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientIds: Array.from(selected) }),
      });

      // Mark newly invited
      setAlreadyInvited((prev) => {
        const next = new Set(prev);
        selected.forEach((id) => next.add(id));
        return next;
      });
      setSelected(new Set());
      setSent(true);
    } catch {
      // Silently fail
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Send className="h-4 w-4" />
        Invite Friends
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-t-2xl bg-white dark:bg-neutral-900 sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-neutral-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Invite Friends
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: "50vh" }}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : friends.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  You're not following anyone yet. Follow people to invite them to events.
                </p>
              ) : (
                <div className="space-y-1">
                  {friends.map((friend) => {
                    const invited = alreadyInvited.has(friend.id);
                    const isSelected = selected.has(friend.id);

                    return (
                      <button
                        key={friend.id}
                        onClick={() => !invited && toggleFriend(friend.id)}
                        disabled={invited}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          invited
                            ? "opacity-60"
                            : isSelected
                              ? "bg-brand-50 dark:bg-brand-950"
                              : "hover:bg-gray-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <UserAvatar
                          src={friend.avatarUrl}
                          name={friend.displayName ?? friend.username}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {friend.displayName ?? friend.username ?? "User"}
                          </p>
                          {friend.username && (
                            <p className="text-xs text-gray-500">@{friend.username}</p>
                          )}
                        </div>
                        {invited ? (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                            <Check className="h-3 w-3" />
                            Invited
                          </span>
                        ) : (
                          <div
                            className={`h-5 w-5 rounded-full border-2 transition-colors ${
                              isSelected
                                ? "border-brand-600 bg-brand-600"
                                : "border-gray-300 dark:border-neutral-600"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-full w-full p-0.5 text-white" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {friends.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 dark:border-neutral-700">
                {sent ? (
                  <p className="text-center text-sm font-medium text-green-600">
                    Invites sent!
                  </p>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={selected.size === 0 || sending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Invite{selected.size > 1 ? "s" : ""}{" "}
                        {selected.size > 0 && `(${selected.size})`}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
