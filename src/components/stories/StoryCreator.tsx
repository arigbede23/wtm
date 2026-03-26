"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2, ImagePlus, Type, Send } from "lucide-react";
import { uploadStoryMedia } from "@/lib/uploadImage";

type StoryCreatorProps = {
  onClose: () => void;
  onCreated: () => void;
};

export function StoryCreator({ onClose, onCreated }: StoryCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handlePost = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const mediaUrl = await uploadStoryMedia(file);

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl,
          mediaType: "image",
          textOverlay: textOverlay.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create story");

      onCreated();
      onClose();
    } catch (error) {
      console.error("Story creation error:", error);
      setLoading(false);
    }
  };

  // Step 1: Camera/gallery picker (Instagram-style)
  if (!preview) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in slide-in-from-bottom duration-300">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/80 active:bg-white/10"
          >
            <X className="h-6 w-6" />
          </button>
          <p className="text-base font-semibold text-white">New Story</p>
          <div className="w-10" />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
          {/* Big camera circle */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-white/30 transition-all active:scale-95 hover:border-white/60 hover:bg-white/5"
          >
            <Camera className="h-12 w-12 text-white/50 transition-colors group-hover:text-white/80" />
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              Add to your story
            </p>
            <p className="mt-1 text-sm text-white/50">
              Share a photo with your followers
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors active:bg-white/20"
            >
              <ImagePlus className="h-5 w-5" />
              Choose Photo
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Step 2: Preview + edit (Instagram-style)
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Image fills the screen */}
      <div className="relative flex-1">
        <img
          src={preview}
          alt="Preview"
          className="h-full w-full object-cover"
        />

        {/* Top controls */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-3">
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setTextOverlay("");
              setShowTextInput(false);
            }}
            className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm active:bg-black/60"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`rounded-full p-2 backdrop-blur-sm active:bg-black/60 ${
                showTextInput || textOverlay
                  ? "bg-white text-black"
                  : "bg-black/40 text-white"
              }`}
            >
              <Type className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Text overlay display */}
        {textOverlay && !showTextInput && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6">
            <p className="text-center text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {textOverlay}
            </p>
          </div>
        )}

        {/* Text input overlay */}
        {showTextInput && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTextInput(false);
            }}
          >
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="Type something..."
              maxLength={150}
              autoFocus
              className="w-4/5 border-b-2 border-white bg-transparent text-center text-2xl font-bold text-white placeholder-white/40 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") setShowTextInput(false);
              }}
            />
          </div>
        )}

        {/* Bottom share bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-8 pt-12">
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-full bg-white/15 px-4 py-2.5 text-sm text-white/50 backdrop-blur-sm">
              Your story
            </div>
            <button
              onClick={handlePost}
              disabled={loading}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-transform active:scale-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
