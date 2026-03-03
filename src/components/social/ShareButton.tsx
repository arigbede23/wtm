// ShareButton — uses Web Share API on mobile, copies link on desktop.

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

type ShareButtonProps = {
  title: string;
  url?: string;
  className?: string;
};

export function ShareButton({ title, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url ?? window.location.href;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // User cancelled or not supported — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={handleShare}
      className={
        className ??
        "flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
      }
    >
      {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
    </button>
  );
}
