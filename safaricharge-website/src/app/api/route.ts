import { NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/config';
import { db } from '@/lib/db';

export async function GET() {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: APP_CONFIG.name,
    version: APP_CONFIG.version,
    database: 'unknown' as 'ok' | 'error' | 'unknown',
    queue: 'unknown' as 'ok' | 'error' | 'unknown',
    pendingJobs: 0,
  };

  try {
    const [_, pendingJobs] = await Promise.all([
      db.$queryRaw`SELECT 1`,
      db.job.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    status.database = 'ok';
    status.queue = 'ok';
    status.pendingJobs = pendingJobs;
  } catch {
    status.database = 'error';
    status.queue = 'error';
  }

  const httpStatus = status.database === 'error' ? 503 : 200;
  return NextResponse.json(status, { status: httpStatus });
}
