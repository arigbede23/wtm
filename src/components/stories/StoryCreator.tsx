"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { uploadStoryMedia } from "@/lib/uploadImage";

type StoryCreatorProps = {
  onClose: () => void;
  onCreated: () => void;
};

export function StoryCreator({ onClose, onCreated }: StoryCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
        {preview && (
          <button
            onClick={handlePost}
            disabled={loading}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Post"
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {!preview ? (
        /* Step 1: File picker */
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10"
          >
            <Camera className="h-8 w-8 text-white" />
          </button>
          <p className="text-sm text-white/70">Add to your story</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Step 2: Preview with text overlay */
        <div className="relative flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Text overlay input */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-6 pt-12">
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="Add text overlay..."
              maxLength={150}
              className="w-full rounded-full bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none backdrop-blur-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
