// Upload helpers for images.
// Uses the browser Supabase client to upload directly to Supabase Storage.

import { createClient } from "@/lib/supabase/client";

export async function uploadEventImage(file: File): Promise<string> {
  const supabase = createClient();

  // Generate a unique filename to avoid collisions
  const ext = file.name.split(".").pop();
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
  const supabase = createClient();

  const ext = file.name.split(".").pop();
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
  const supabase = createClient();

  const ext = file.name.split(".").pop();
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
