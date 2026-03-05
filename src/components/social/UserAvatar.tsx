// UserAvatar — circle avatar with image or letter fallback.
// Supports sm (32px), md (40px), lg (64px) sizes.

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const letter = (name ?? "?")[0].toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name ?? "User"}
        onError={() => setImgError(true)}
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700",
        sizeClasses[size],
        className
      )}
    >
      {letter}
    </div>
  );
}
