-- Phase 5: Social Features — Tables + RLS Policies
-- Run this in the Supabase Dashboard SQL Editor (or via supabase db push)

-- =============================================================
-- 1. Create NotificationType enum
-- =============================================================
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('NEW_FOLLOWER', 'FRIEND_GOING', 'FRIEND_INTERESTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================================
-- 2. Create follows table
-- =============================================================
CREATE TABLE IF NOT EXISTS "follows" (
  "id"          TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "followerId"  TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "followingId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE ("followerId", "followingId")
);

-- =============================================================
-- 3. Create notifications table
-- =============================================================
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"        TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId"    TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "actorId"   TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"      "NotificationType" NOT NULL,
  "eventId"   TEXT REFERENCES "events"("id") ON DELETE CASCADE,
  "read"      BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications" ("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications" ("userId", "createdAt");

-- =============================================================
-- 4. RLS — follows table
-- =============================================================
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;

-- Anyone can read follows (public follower counts, etc.)
CREATE POLICY "follows_select_public"
  ON "follows" FOR SELECT
  USING (true);

-- Authenticated users can follow others (insert where they are the follower)
CREATE POLICY "follows_insert_own"
  ON "follows" FOR INSERT
  WITH CHECK (auth.uid()::text = "followerId");

-- Authenticated users can unfollow (delete their own follows)
CREATE POLICY "follows_delete_own"
  ON "follows" FOR DELETE
  USING (auth.uid()::text = "followerId");

-- =============================================================
-- 5. RLS — notifications table
-- =============================================================
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own"
  ON "notifications" FOR SELECT
  USING (auth.uid()::text = "userId");

-- Actors can create notifications for others
CREATE POLICY "notifications_insert_actor"
  ON "notifications" FOR INSERT
  WITH CHECK (auth.uid()::text = "actorId");

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON "notifications" FOR UPDATE
  USING (auth.uid()::text = "userId");

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON "notifications" FOR DELETE
  USING (auth.uid()::text = "userId");

-- =============================================================
-- 6. Enable Realtime on notifications (for live badge updates)
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";
