-- Push notification subscriptions table
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE ("userId", endpoint)
);
CREATE INDEX idx_push_subs_user ON push_subscriptions("userId");
