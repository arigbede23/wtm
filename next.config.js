// Next.js Configuration — controls how the framework builds and serves the app.
// Docs: https://nextjs.org/docs/app/api-reference/next-config-js

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

module.exports = nextConfig;
