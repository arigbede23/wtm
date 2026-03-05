-- Comments table for event discussions
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "eventId" TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_comments_event ON comments("eventId", "createdAt");

-- Add EVENT_UPDATED notification type
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_UPDATED';
