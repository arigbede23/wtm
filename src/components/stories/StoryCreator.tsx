"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, Type, Send, ImagePlus, RotateCcw, Minus, Plus } from "lucide-react";
import { uploadStoryMedia } from "@/lib/uploadImage";

type StoryCreatorProps = {
  onClose: () => void;
  onCreated: () => void;
};

const FONTS = [
  { name: "Classic", value: "font-sans", style: "font-bold" },
  { name: "Serif", value: "font-serif", style: "font-bold italic" },
  { name: "Mono", value: "font-mono", style: "font-semibold" },
  { name: "Cursive", value: "", style: "font-normal", css: "'Segoe Script', 'Dancing Script', cursive" },
  { name: "Impact", value: "", style: "font-black uppercase tracking-wider", css: "Impact, 'Arial Black', sans-serif" },
];

export function StoryCreator({ onClose, onCreated }: StoryCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [fontIndex, setFontIndex] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [textPos, setTextPos] = useState({ x: 50, y: 50 }); // percentage
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const font = FONTS[fontIndex];

  const startCamera = useCallback(async (facing: "user" | "environment") => {
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
    setFontIndex(0);
    setFontSize(24);
    setTextPos({ x: 50, y: 50 });
    startCamera(facingMode);
  };

  // Drag text on touch/mouse
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (showTextInput) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    setTextPos({ x, y });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handlePost = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
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
        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
          />
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
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pb-6 pt-3 bg-gradient-to-b from-black/50 to-transparent">
            <button onClick={onClose} className="rounded-full bg-black/30 p-2 text-white backdrop-blur-sm">
              <X className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-white drop-shadow">New Story</p>
            <div className="w-9" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-[max(2rem,env(safe-area-inset-bottom,2rem))] pt-12">
            <div className="flex items-end justify-between">
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <ImagePlus className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] text-white/70">Gallery</span>
              </button>
              {cameraReady && (
                <button
                  onClick={handleCapture}
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white active:scale-90 transition-transform"
                >
                  <div className="h-[60px] w-[60px] rounded-full bg-white" />
                </button>
              )}
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
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  // Preview + edit mode
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      <div ref={containerRef} className="relative flex-1">
        <img src={preview} alt="Preview" className="h-full w-full object-cover" />

        {/* Top controls */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 pb-8 pt-3">
          <button onClick={handleBack} className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
            <X className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {/* Font picker */}
            {textOverlay && !showTextInput && (
              <button
                onClick={() => setFontIndex((i) => (i + 1) % FONTS.length)}
                className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
              >
                {FONTS[(fontIndex + 1) % FONTS.length].name}
              </button>
            )}
            {/* Size controls */}
            {textOverlay && !showTextInput && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize((s) => Math.max(14, s - 4))}
                  className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setFontSize((s) => Math.min(48, s + 4))}
                  className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Text toggle */}
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className={`rounded-full p-2 backdrop-blur-sm ${
                showTextInput || textOverlay ? "bg-white text-black" : "bg-black/40 text-white"
              }`}
            >
              <Type className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Draggable text overlay display */}
        {textOverlay && !showTextInput && (
          <div
            className="absolute z-10 cursor-grab select-none active:cursor-grabbing"
            style={{
              left: `${textPos.x}%`,
              top: `${textPos.y}%`,
              transform: "translate(-50%, -50%)",
              maxWidth: "85%",
            }}
            onTouchStart={handleDragStart}
            onMouseDown={handleDragStart}
          >
            <p
              className={`text-center text-white ${font.value} ${font.style}`}
              style={{
                fontSize: `${fontSize}px`,
                textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)",
                fontFamily: font.css || undefined,
                lineHeight: 1.2,
              }}
            >
              {textOverlay}
            </p>
            <p className="mt-1 text-center text-[10px] text-white/40">
              Drag to move
            </p>
          </div>
        )}

        {/* Text input overlay */}
        {showTextInput && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTextInput(false);
            }}
          >
            {/* Font selector pills */}
            <div className="mb-6 flex gap-2">
              {FONTS.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => setFontIndex(i)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    i === fontIndex
                      ? "bg-white text-black"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="Type something..."
              maxLength={150}
              autoFocus
              className={`w-4/5 border-b-2 border-white bg-transparent text-center text-white placeholder-white/40 outline-none ${font.value} ${font.style}`}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: font.css || undefined,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") setShowTextInput(false);
              }}
            />
            {/* Size slider */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-white/60">Size</span>
              <input
                type="range"
                min={14}
                max={48}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-40 accent-white"
              />
            </div>
          </div>
        )}

        {/* Bottom share bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[max(2rem,env(safe-area-inset-bottom,2rem))] pt-12">
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
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
