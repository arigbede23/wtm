// Next.js Configuration — controls how the framework builds and serves the app.
// Docs: https://nextjs.org/docs/app/api-reference/next-config-js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
  images: {
    // Allow loading images from trusted external domains only.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lqapbkfbvlcqvnurszhv.supabase.co",
      },
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
      {
        protocol: "https",
        hostname: "*.ticketm.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.evbuc.com",
      },
      {
        protocol: "https",
        hostname: "**.eventbritecdn.com",
      },
      {
        protocol: "https",
        hostname: "unpkg.com",
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
      },
    ],
  },
};

module.exports = nextConfig;
