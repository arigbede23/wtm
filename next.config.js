// Next.js Configuration — controls how the framework builds and serves the app.
// Docs: https://nextjs.org/docs/app/api-reference/next-config-js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow loading images from ANY https domain.
    // This is needed because event cover images come from external URLs
    // (e.g., images.unsplash.com). Without this, Next.js blocks external images.
    // In production, you'd restrict this to specific trusted domains.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // ** = wildcard, matches any hostname
      },
    ],
  },
};

module.exports = nextConfig;
