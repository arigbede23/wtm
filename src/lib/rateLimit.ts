// Simple in-memory rate limiter for API routes.
// Uses a sliding window per IP address.

const windowMs = 60 * 1000; // 1 minute window
const requests = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requests) {
    if (now > value.resetAt) {
      requests.delete(key);
    }
  }
}, 60 * 1000);

export function rateLimit(
  ip: string,
  limit: number = 60
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count++;

  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - entry.count };
}

export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    { status: 429, headers: { "Content-Type": "application/json" } }
  );
}
