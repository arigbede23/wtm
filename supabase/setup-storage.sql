-- Run this in the Supabase Dashboard → SQL Editor
-- Creates the event-images storage bucket and policies for Phase 3

-- 1. Create the public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- 3. Allow anyone to read/view images (public bucket)
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- 4. Allow users to update their own uploads
CREATE POLICY "Users can update own event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = owner_id::text);

-- 5. Allow users to delete their own uploads
CREATE POLICY "Users can delete own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = owner_id::text);
