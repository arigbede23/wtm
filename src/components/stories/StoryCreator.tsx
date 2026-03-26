"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, Type, Send, ImagePlus, RotateCcw } from "lucide-react";
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
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setCameraError(false);
    } catch {
      setCameraError(true);
      setCameraReady(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const captured = new File([blob], "story.jpg", { type: "image/jpeg" });
      setFile(captured);
      setPreview(URL.createObjectURL(captured));
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const handleBack = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setTextOverlay("");
    setShowTextInput(false);
    startCamera(facingMode);
  };

  const [error, setError] = useState("");

  const handlePost = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      let mediaUrl: string;
      try {
        mediaUrl = await uploadStoryMedia(file);
      } catch (uploadErr: any) {
        throw new Error(`Upload failed: ${uploadErr?.message || "unknown error"}`);
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl,
          mediaType: "image",
          textOverlay: textOverlay.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create story");
      }

      onCreated();
      onClose();
    } catch (err: any) {
      console.error("Story creation error:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  // Camera mode
  if (!preview) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera viewfinder */}
        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
          />

          {/* Camera error fallback */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
              <p className="text-sm text-white/60">Camera not available</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white"
              >
                <ImagePlus className="h-5 w-5" />
                Choose from gallery
              </button>
            </div>
          )}

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pb-6 pt-3 bg-gradient-to-b from-black/50 to-transparent">
            <button
              onClick={onClose}
              className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-white drop-shadow">New Story</p>
            <div className="w-9" />
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-[max(2rem,env(safe-area-inset-bottom,2rem))] pt-12">
            <div className="flex items-end justify-between">
              {/* Gallery picker */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <ImagePlus className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] text-white/70">Gallery</span>
              </button>

              {/* Shutter button */}
              {cameraReady && (
                <button
                  onClick={handleCapture}
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white active:scale-90 transition-transform"
                >
                  <div className="h-[60px] w-[60px] rounded-full bg-white" />
                </button>
              )}

              {/* Flip camera */}
              <button
                onClick={() => setFacingMode((f) => f === "user" ? "environment" : "user")}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <RotateCcw className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] text-white/70">Flip</span>
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Preview + edit mode
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      <div className="relative flex-1">
        <img
          src={preview}
          alt="Preview"
          className="h-full w-full object-cover"
        />

        {/* Top controls */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-3">
          <button
            onClick={handleBack}
            className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`rounded-full p-2 backdrop-blur-sm ${
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[max(2rem,env(safe-area-inset-bottom,2rem))] pt-12">
          {error && (
            <p className="mb-3 rounded-lg bg-red-500/80 px-3 py-2 text-center text-xs text-white">
              {error}
            </p>
          )}
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
