// Upload helpers for images.
// Uses the browser Supabase client to upload directly to Supabase Storage.

import { createClient } from "@/lib/supabase/client";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum size is 10MB.");
  }
}

function getSafeExtension(file: File): string {
  const typeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return typeToExt[file.type] ?? "jpg";
}

export async function uploadEventImage(file: File): Promise<string> {
  validateFile(file);
  const supabase = createClient();

  const ext = getSafeExtension(file);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(filename, file);

  if (error) throw error;

  // Get the public URL for the uploaded file
  const { data } = supabase.storage
    .from("event-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}

export async function uploadStoryMedia(file: File): Promise<string> {
  validateFile(file);
  const supabase = createClient();

  const ext = getSafeExtension(file);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(`stories/${filename}`, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("event-images")
    .getPublicUrl(`stories/${filename}`);

  return data.publicUrl;
}

export async function uploadAvatarImage(file: File): Promise<string> {
  validateFile(file);
  const supabase = createClient();

  const ext = getSafeExtension(file);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("user-avatars")
    .upload(filename, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("user-avatars")
    .getPublicUrl(filename);

  return data.publicUrl;
}
