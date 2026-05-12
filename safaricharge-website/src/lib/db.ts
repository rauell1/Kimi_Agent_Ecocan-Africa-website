import { PrismaClient } from '@prisma/client'
import path from 'path'
import { env } from '@/lib/env'
import { attachVersioningMiddleware } from '@/lib/versioning'

// Prisma's SQLite query engine resolves relative paths from the binary
// location rather than the process working directory. Convert relative
// SQLite URLs (e.g. "file:./db/custom.db") to absolute paths so the
// database file is always found regardless of the runtime CWD.
function resolveDatabaseUrl(): string | undefined {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NO_SSL ||
    env.DATABASE_URL

  if (!url) {
    throw new Error(
      'DATABASE_URL is not configured. Set DATABASE_URL or a Vercel Postgres URL (POSTGRES_PRISMA_URL / POSTGRES_URL).'
    )
  }

  if (url?.startsWith('file:./') || url?.startsWith('file:../')) {
    return 'file:' + path.resolve(process.cwd(), url.slice('file:'.length))
  }
  return url
}

// Database client with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  attachVersioningMiddleware(
    globalForPrisma.prisma ??
      new PrismaClient({
        datasources: { db: { url: resolveDatabaseUrl() } },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
