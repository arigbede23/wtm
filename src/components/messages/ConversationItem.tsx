// ConversationItem — single conversation row with avatar, preview, and unread indicator.

"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/social/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";

export type Conversation = {
  id: string;
  otherUser: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  lastMessage: {
    text: string;
    createdAt: string;
    senderId: string;
  } | null;
  unread: boolean;
};

type ConversationItemProps = {
  conversation: Conversation;
};

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { otherUser, lastMessage, unread } = conversation;
  const name = otherUser.displayName ?? otherUser.username ?? "User";

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
    >
      <UserAvatar
        src={otherUser.avatarUrl}
        name={name}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${
            unread
              ? "font-bold text-gray-900 dark:text-white"
              : "font-medium text-gray-900 dark:text-white"
          }`}
        >
          {name}
        </p>
        {lastMessage && (
          <p className="truncate text-xs text-gray-500">
            {lastMessage.text}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {lastMessage && (
          <p className="text-xs text-gray-400">
            {formatRelativeTime(lastMessage.createdAt)}
          </p>
        )}
        {unread && (
          <div className="h-2 w-2 rounded-full bg-brand-600" />
        )}
      </div>
    </Link>
  );
}
