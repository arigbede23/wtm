// Prisma Client Singleton
// Creates a single Prisma database connection that gets reused.
// Without this, Next.js hot-reloading in dev would create a new connection
// every time you save a file, eventually running out of database connections.
// Note: Currently the app uses Supabase JS client for queries, but Prisma
// is still available for migrations and future server-side use.

import { PrismaClient } from "@prisma/client";

// Store the client on globalThis so it survives hot reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Only cache in development — in production, a new client per cold start is fine
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
