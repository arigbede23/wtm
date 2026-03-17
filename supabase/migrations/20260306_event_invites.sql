-- Add EVENT_INVITE to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EVENT_INVITE';

-- Invites table
CREATE TABLE invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "eventId" TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "senderId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "recipientId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE ("eventId", "senderId", "recipientId")
);
CREATE INDEX idx_invites_recipient ON invites("recipientId", status);
