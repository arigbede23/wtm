// SaveButton — client component for the bookmark/save toggle on event detail page.
// Shows filled bookmark when saved, outline when not.

"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type SaveButtonProps = {
  eventId: string;
};

export default function SaveButton({ eventId }: SaveButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if event is already saved on mount
  useEffect(() => {
    if (!user) return;

    fetch("/api/saved-events")
      .then((res) => res.json())
      .then((events: any[]) => {
        if (Array.isArray(events)) {
          setSaved(events.some((e) => e.id === eventId));
        }
      })
      .catch(() => {});
  }, [user, eventId]);

  const handleToggle = async () => {
    if (!user || loading) return;

    setLoading(true);
    const prevSaved = saved;
    setSaved(!saved); // Optimistic update

    try {
      const res = await fetch("/api/saved-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) throw new Error();
    } catch {
      setSaved(prevSaved); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
    >
      <Bookmark className={`h-5 w-5 ${saved ? "fill-white" : ""}`} />
    </button>
  );
}
