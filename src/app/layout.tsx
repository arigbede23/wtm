import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "wtm? — what's the move?",
  description: "Discover events and things to do near you",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "wtm?",
  },
};

export const viewport: Viewport = {
  themeColor: "#4c6ef5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
