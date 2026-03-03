// Middleware — runs BEFORE every page request.
// Its job here is to refresh the Supabase auth session cookie so users stay logged in.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// "matcher" tells Next.js which routes to run middleware on.
// This regex skips static files (images, fonts, etc.) since they don't need auth.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
