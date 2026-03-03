// Providers — wraps the app with context providers that child components need.
// "use client" is required because providers use React state/context (browser-only features).

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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
  // Any component can now use useQuery() to fetch and cache data.
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
