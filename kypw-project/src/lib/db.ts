/**
 * KYPW Database Client — Supabase PostgreSQL
 *
 * Uses Prisma with Supabase's connection pooler (DATABASE_URL)
 * and a direct connection for migrations (DIRECT_URL).
 *
 * Connection architecture:
 *   - DATABASE_URL  → Supabase pooler (port 6543) — for application queries
 *   - DIRECT_URL    → Supabase direct (port 5432) — for migrations/schema changes
 *
 * On Vercel, each serverless function gets its own Prisma Client instance
 * that is automatically cleaned up after the request completes.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create a new PrismaClient connected to Supabase PostgreSQL.
 *
 * In development: cached on `globalThis` to survive HMR re-renders.
 * In production (Vercel): a new instance per serverless function invocation
 * is created and garbage collected automatically.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

// Cache in development only — prevents exhausting connection pool during HMR
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
