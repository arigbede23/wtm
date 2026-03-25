// Create Event Page — multi-step wizard for creating user events.
// Step 1: Basics (title, category, description)
// Step 2: When & Where (dates, address, optional map pin)
// Step 3: Details (cover image, pricing, external URL)
// Auth guard: redirects to /login if not signed in.

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { uploadEventImage } from "@/lib/uploadImage";
import { CATEGORY_EMOJI, type EventCategory } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  X,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { buildDirectionsUrl } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamic import for Leaflet LocationPicker (needs browser DOM)
const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker"),
  { ssr: false, loading: () => <div className="h-[200px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800" /> }
);

const CATEGORIES: EventCategory[] = [
  "MUSIC", "SPORTS", "ARTS", "FOOD", "TECH", "SOCIAL",
  "COMEDY", "WELLNESS", "OUTDOORS", "NIGHTLIFE", "COMMUNITY", "OTHER",
];

type FormData = {
  title: string;
  category: EventCategory;
  description: string;
  startDate: string;
  endDate: string;
  address: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  coverImageUrl: string;
  coverImageFile: File | null;
  isFree: boolean;
  price: string;
  url: string;
};

const INITIAL_FORM: FormData = {
  title: "",
  category: "OTHER",
  description: "",
  startDate: "",
  endDate: "",
  address: "",
  city: "",
  state: "",
  lat: null,
  lng: null,
  coverImageUrl: "",
  coverImageFile: null,
  isFree: true,
  price: "",
  url: "",
};

export default function CreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateField("coverImageFile", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    updateField("coverImageFile", null);
    updateField("coverImageUrl", "");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError("");

    try {
      // Upload image if one was selected
      let coverImageUrl = form.coverImageUrl;
      if (form.coverImageFile) {
        coverImageUrl = await uploadEventImage(form.coverImageFile);
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description || null,
          startDate: new Date(form.startDate).toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          lat: form.lat,
          lng: form.lng,
          coverImageUrl: coverImageUrl || null,
          isFree: form.isFree,
          price: form.isFree ? null : parseFloat(form.price) || null,
          url: form.url || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create event");
      }

      const event = await res.json();

      // Invalidate events cache so feed/map update
      queryClient.invalidateQueries({ queryKey: ["events"] });

      // Navigate to the new event
      router.push(`/event/${event.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  // Auth guard: redirect to login if not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-4xl">🔒</p>
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
          Sign in required
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          You need to be signed in to create an event.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Validate current step before advancing
  const canAdvance = () => {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return form.startDate.length > 0;
    return true;
  };

  return (
    <div className="p-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Create Event
      </h1>

      {/* Progress dots */}
      <div className="mt-3 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-brand-600" : "bg-gray-200 dark:bg-neutral-700"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        Step {step} of 3 —{" "}
        {step === 1 ? "Basics" : step === 2 ? "When & Where" : "Details"}
      </p>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Event Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="What's the event called?"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateField("category", cat)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    form.category === cat
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
                >
                  {CATEGORY_EMOJI[cat]} {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell people about your event..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Step 2: When & Where */}
      {step === 2 && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="123 Main St"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="New York"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="NY"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Map pin picker */}
          <div>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <MapPin className="h-4 w-4" />
              {showMap ? "Hide map" : "Pin location on map (optional)"}
            </button>
            {form.lat != null && form.lng != null && (
              <span className="ml-2 text-xs text-gray-500">
                {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
              </span>
            )}
            {showMap && (
              <div className="mt-2">
                <LocationPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={(coords) => {
                    updateField("lat", coords.lat);
                    updateField("lng", coords.lng);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Click on the map to place a pin
                </p>
              </div>
            )}
          </div>

          {/* Get Directions preview */}
          {(() => {
            const url = buildDirectionsUrl({ lat: form.lat, lng: form.lng, address: form.address, city: form.city, state: form.state });
            return url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Navigation className="h-4 w-4" />
                Preview Directions
              </a>
            ) : null;
          })()}
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="mt-4 space-y-4">
          {/* Cover image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Cover Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="aspect-[16/9] w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 py-8 transition-colors hover:border-brand-400 dark:border-neutral-700">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Free / Paid toggle */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Pricing
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateField("isFree", true)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.isFree
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => updateField("isFree", false)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  !form.isFree
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-neutral-400"
                }`}
              >
                Paid
              </button>
            </div>
            {!form.isFree && (
              <div className="mt-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* External URL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-neutral-300">
              External Link
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => updateField("url", e.target.value)}
              placeholder="https://tickets.example.com"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canAdvance()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Event"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
