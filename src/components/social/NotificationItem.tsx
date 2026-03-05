// NotificationItem — single notification row with avatar, text, and relative time.

"use client";

import Link from "next/link";
import { UserAvatar } from "./UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import type { NotificationItem as NotificationItemType } from "@/types";

type NotificationItemProps = {
  notification: NotificationItemType;
};

function getNotificationText(notification: NotificationItemType): {
  text: string;
  href: string;
} {
  const actorName =
    notification.actor.displayName ??
    notification.actor.username ??
    "Someone";

  switch (notification.type) {
    case "NEW_FOLLOWER":
      return {
        text: `${actorName} started following you`,
        href: `/user/${notification.actor.id}`,
      };
    case "FRIEND_GOING":
      return {
        text: `${actorName} is going to ${notification.event?.title ?? "an event"}`,
        href: notification.event
          ? `/event/${notification.event.id}`
          : `/user/${notification.actor.id}`,
      };
    case "FRIEND_INTERESTED":
      return {
        text: `${actorName} is interested in ${notification.event?.title ?? "an event"}`,
        href: notification.event
          ? `/event/${notification.event.id}`
          : `/user/${notification.actor.id}`,
      };
    case "EVENT_UPDATED":
      return {
        text: `${actorName} updated ${notification.event?.title ?? "an event"}`,
        href: notification.event
          ? `/event/${notification.event.id}`
          : `/user/${notification.actor.id}`,
      };
  }
}

export function NotificationItemRow({ notification }: NotificationItemProps) {
  const { text, href } = getNotificationText(notification);

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        !notification.read ? "bg-brand-50/50 dark:bg-brand-950/20" : ""
      }`}
    >
      <UserAvatar
        src={notification.actor.avatarUrl}
        name={notification.actor.displayName ?? notification.actor.username}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900 dark:text-gray-100">{text}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
      )}
    </Link>
  );
}
