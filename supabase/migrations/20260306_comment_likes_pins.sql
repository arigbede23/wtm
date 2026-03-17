-- Add pinned column to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Comment likes table
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "commentId" UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE ("commentId", "userId")
);
CREATE INDEX idx_comment_likes_comment ON comment_likes("commentId");
