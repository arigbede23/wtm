// Onboarding Page — interest picker shown after signup.
// User selects categories they're interested in, then continues to the feed.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggle(category: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size === 0) {
      router.push("/feed");
      return;
    }

    setSaving(true);
    const interests = Array.from(selected);

    try {
      // Save interests
      await fetch("/api/users/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });

      // Fire-and-forget: generate user embedding
      fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "embed-user" }),
      }).catch(() => {});

      router.push("/feed");
    } catch {
      // If saving fails, still go to feed
      router.push("/feed");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          What are you into?
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Pick your interests so we can recommend events you&apos;ll love
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {CATEGORIES.map(({ value, label }) => {
          const isSelected = selected.has(value);
          return (
            <button
              key={value}
              onClick={() => toggle(value)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                isSelected
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                  : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              <CategoryIcon category={value} className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : selected.size > 0
              ? `Continue (${selected.size} selected)`
              : "Continue"}
        </button>

        <button
          onClick={() => router.push("/feed")}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
