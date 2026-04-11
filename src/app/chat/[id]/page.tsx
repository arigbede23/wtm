// Chat View — real-time messaging between two users.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/social/UserAvatar";
import { ChatInput } from "@/components/messages/ChatInput";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventLinkPreview } from "@/components/messages/EventLinkPreview";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

type OtherUser = {
  id: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

function formatMessageTime(date: string): string {
  // Supabase returns timestamps without timezone suffix — treat as UTC
  const d = new Date(date.endsWith("Z") || date.includes("+") ? date : date + "Z");
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " + time;
}

// Match URLs in message text — used to make links clickable
const URL_REGEX = /https?:\/\/[^\s]+/g;

// Extract event ID from an event page URL (e.g. https://domain.com/event/uuid or /event/uuid)
const EVENT_PATH_REGEX = /\/event\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

function extractEventId(url: string): string | null {
  const match = url.match(EVENT_PATH_REGEX);
  return match ? match[1] : null;
}

// Render message text with clickable links
function MessageText({ text, isSent }: { text: string; isSent: boolean }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(URL_REGEX.source, "g");

  while ((match = regex.exec(text)) !== null) {
    // Text before this URL
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline break-all ${isSent ? "text-white/90 hover:text-white" : "text-brand-600 hover:text-brand-700 dark:text-brand-400"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }

  // Remaining text after last URL
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : <>{text}</>;
}

function MessageBubble({
  message,
  isSent,
  isFirst,
  isLast,
  showTimeGap,
}: {
  message: Message;
  isSent: boolean;
  isFirst: boolean;
  isLast: boolean;
  showTimeGap: boolean;
}) {
  const [showTime, setShowTime] = useState(false);

  // Find event IDs from any event links in the message
  const eventIds: string[] = [];
  let urlMatch: RegExpExecArray | null;
  const urlScan = new RegExp(URL_REGEX.source, "g");
  while ((urlMatch = urlScan.exec(message.text)) !== null) {
    const eid = extractEventId(urlMatch[0]);
    if (eid && !eventIds.includes(eid)) eventIds.push(eid);
  }

  // iMessage-style radius — both sides use the same logic mirrored:
  // top-left, top-right, bottom-right, bottom-left
  const R = "1.25rem"; // fully rounded
  const r = "0.25rem"; // flat (grouped edge)

  let radius: string;
  if (isSent) {
    // Sent: left side always rounded, right side flat when grouped
    const topRight = isFirst ? R : r;
    const bottomRight = isLast ? R : r;
    radius = `${R} ${topRight} ${bottomRight} ${R}`;
  } else {
    // Received: right side always rounded, left side flat when grouped
    const topLeft = isFirst ? R : r;
    const bottomLeft = isLast ? R : r;
    radius = `${topLeft} ${R} ${R} ${bottomLeft}`;
  }

  return (
    <>
      {showTimeGap && (
        <p className="pb-1 pt-3 text-center text-[11px] font-medium text-gray-400 dark:text-neutral-500">
          {formatMessageTime(message.createdAt)}
        </p>
      )}
      <div
        className={`flex ${isSent ? "justify-end" : "justify-start"} ${isFirst && !showTimeGap ? "mt-3" : ""}`}
        onClick={() => setShowTime((s) => !s)}
      >
        <div className="max-w-[78%]">
          <div
            className={`px-3.5 py-2 text-[15px] leading-snug ${
              isSent
                ? "bg-brand-600 text-white"
                : "bg-gray-200 text-gray-900 dark:bg-neutral-700 dark:text-white"
            }`}
            style={{ borderRadius: radius }}
          >
            <MessageText text={message.text} isSent={isSent} />
          </div>

          {/* Event link previews */}
          {eventIds.map((eid) => (
            <EventLinkPreview key={eid} eventId={eid} isSent={isSent} />
          ))}
        </div>
      </div>
      {showTime && (
        <p className={`mt-0.5 text-[10px] text-gray-400 ${isSent ? "text-right pr-1" : "pl-1"}`}>
          {formatMessageTime(message.createdAt)}
        </p>
      )}
    </>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages on mount
  useEffect(() => {
    if (!user) return;

    fetch(`/api/conversations/${conversationId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
        if (data.otherUser) setOtherUser(data.otherUser);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates (optimistic messages already added)
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  // Send message handler
  const handleSend = useCallback(
    async (text: string) => {
      if (!user) return;

      // Optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user.id,
        text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          }
        );
        const data = await res.json();
        if (data.id) {
          // Replace optimistic message with the real one
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticMessage.id ? data : m))
          );
        }
      } catch {
        // Remove optimistic message on failure
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticMessage.id)
        );
      }
    },
    [user, conversationId]
  );

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const otherName =
    otherUser?.displayName ?? otherUser?.username ?? "User";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-900/80">
        <Link
          href="/messages"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900 dark:text-white" />
        </Link>
        <UserAvatar
          src={otherUser?.avatarUrl}
          name={otherName}
          size="sm"
        />
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {otherName}
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-[3px]">
            {messages.map((message, idx) => {
              const isSent = message.senderId === user.id;
              const prev = messages[idx - 1];
              const next = messages[idx + 1];
              const sameSenderPrev = prev?.senderId === message.senderId;
              const sameSenderNext = next?.senderId === message.senderId;

              const parseTime = (d: string) => new Date(d.endsWith("Z") || d.includes("+") ? d : d + "Z").getTime();
              const showTimeGap = !prev || parseTime(message.createdAt) - parseTime(prev.createdAt) > 15 * 60 * 1000;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isSent={isSent}
                  isFirst={!sameSenderPrev}
                  isLast={!sameSenderNext}
                  showTimeGap={showTimeGap}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
