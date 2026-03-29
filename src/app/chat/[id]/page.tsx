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

function MessageBubble({
  message,
  isSent,
  borderRadius,
  showTimeGap,
  addTopSpace,
}: {
  message: Message;
  isSent: boolean;
  borderRadius: string;
  showTimeGap: boolean;
  addTopSpace: boolean;
}) {
  const [showTime, setShowTime] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    // Sent messages swipe left, received swipe right
    if (isSent && delta < 0) setSwipeX(Math.max(delta * 0.4, -60));
    if (!isSent && delta > 0) setSwipeX(Math.min(delta * 0.4, 60));
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeX) > 20) {
      setShowTime(true);
      setTimeout(() => setShowTime(false), 2000);
    }
    setSwipeX(0);
    touchStartX.current = null;
  };

  return (
    <>
      {showTimeGap && (
        <p className="py-2 text-center text-[11px] text-gray-400 dark:text-neutral-500">
          {formatMessageTime(message.createdAt)}
        </p>
      )}
      <div className={`flex ${isSent ? "justify-end" : "justify-start"} ${addTopSpace ? "mt-2" : ""}`}>
        <div className={`flex items-center gap-2 ${isSent ? "flex-row-reverse" : ""}`}>
          <div
            className={`max-w-[75%] px-3.5 py-2 text-sm transition-transform duration-150 ${
              isSent
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white"
            }`}
            style={{
              borderRadius,
              transform: `translateX(${swipeX}px)`,
            }}
            onClick={() => setShowTime((s) => !s)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {message.text}
          </div>
          <span
            className={`text-[10px] text-gray-400 transition-all duration-200 ${
              showTime || Math.abs(swipeX) > 10
                ? "w-auto opacity-100"
                : "w-0 overflow-hidden opacity-0"
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      </div>
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
          <div className="space-y-1">
            {messages.map((message, idx) => {
              const isSent = message.senderId === user.id;
              const prev = messages[idx - 1];
              const next = messages[idx + 1];
              const sameSenderPrev = prev?.senderId === message.senderId;
              const sameSenderNext = next?.senderId === message.senderId;

              // Group bubbles: adjust border radius for consecutive messages
              const radiusSent = `${sameSenderPrev ? "0.5rem" : "1.25rem"} 0.25rem 0.25rem ${sameSenderNext ? "0.5rem" : "1.25rem"}`;
              const radiusRecv = `0.25rem ${sameSenderPrev ? "0.5rem" : "1.25rem"} ${sameSenderNext ? "0.5rem" : "1.25rem"} 0.25rem`;

              // Show time gap between message groups (>5 min apart)
              const showTimeGap = !prev || new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isSent={isSent}
                  borderRadius={isSent ? radiusSent : radiusRecv}
                  showTimeGap={showTimeGap}
                  addTopSpace={!sameSenderPrev}
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
