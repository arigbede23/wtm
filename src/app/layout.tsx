// Root Layout — this wraps EVERY page in the app.
// It sets up the HTML structure, fonts, global CSS, and providers.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates

import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

// Load Outfit font from Google Fonts and make it available as a CSS variable
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Metadata — sets the page title, description, and PWA settings.
// This info appears in browser tabs, search results, and when sharing links.
export const metadata: Metadata = {
  title: "wtm? — what's the move?",
  description: "Discover events and things to do near you",
  manifest: "/manifest.json", // PWA manifest for install prompts
  appleWebApp: {
    capable: true,             // Allows "Add to Home Screen" on iOS
    statusBarStyle: "default",
    title: "wtm?",
  },
};

// Viewport — controls how the page scales on mobile devices.
// maximumScale: 1 and userScalable: false prevent pinch-to-zoom
// which makes the app feel more like a native mobile app.
export const viewport: Viewport = {
  themeColor: "#C8102E",    // Browser toolbar color (our brand red)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// The actual layout component — renders on every page
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Providers wraps the app with TanStack Query for data fetching */}
        <Providers>
          {children}
          {/* Registers the service worker for offline/PWA support */}
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
