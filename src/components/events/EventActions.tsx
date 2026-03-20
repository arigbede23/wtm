"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export function EventActions({
  eventId,
  organizerId,
}: {
  eventId: string;
  organizerId: string | null;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Only show for the event organizer
  if (!user || user.id !== organizerId) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/feed");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete event");
        setDeleting(false);
        setShowConfirm(false);
      }
    } catch {
      alert("Failed to delete event");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="mb-3 flex gap-2">
      <Link
        href={`/edit/${eventId}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Event
      </Link>

      {showConfirm ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Confirm Delete"
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={deleting}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Event
        </button>
      )}
    </div>
  );
}
