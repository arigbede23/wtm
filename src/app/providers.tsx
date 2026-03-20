// Providers — wraps the app with context providers that child components need.
// "use client" is required because providers use React state/context (browser-only features).

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { LocalTeamProvider } from "@/components/layout/LocalTeamProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a single QueryClient instance for the entire app.
  // useState ensures it's created once and reused across re-renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered "fresh" for 60 seconds.
            // During that time, TanStack Query won't re-fetch from the API.
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // QueryClientProvider makes TanStack Query available to all child components.
  // LocalTeamProvider detects the nearest sports team and injects brand colors
  // as CSS variables — wrapping at the root ensures ALL pages get team theming.
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <LocalTeamProvider>{children}</LocalTeamProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
