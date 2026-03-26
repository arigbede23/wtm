// ChatInput — message input bar fixed at the bottom of the chat view.

"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10">
      <div className="mx-auto max-w-md border-t border-gray-200 bg-white px-4 py-3 pb-[env(safe-area-inset-bottom)] dark:border-neutral-800 dark:bg-black">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Message..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
