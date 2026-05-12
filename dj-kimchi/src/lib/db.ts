import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const envDbUrl = process.env.DATABASE_URL?.trim();
const localDbPath = `file:${path.join(process.cwd(), "db", "custom.db")}`;

const isDbConfigured = Boolean(envDbUrl);
const dbUrl = envDbUrl || localDbPath;
const enableDb = isDbConfigured || process.env.NODE_ENV !== "production";

const prisma = enableDb
  ? globalForPrisma.prisma ??
    new PrismaClient({
      datasourceUrl: dbUrl,
      log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
    })
  : null;

if (enableDb && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma ?? undefined;
}

export const db = prisma;

export function isDatabaseEnabled(): boolean {
  return enableDb && !!prisma;
}

export function isDatabaseConfigured(): boolean {
  return isDbConfigured;
}
