import { NextRequest } from 'next/server';
import { getCronSecret } from '@/lib/env';
import { cleanupExpiredSessions } from '@/lib/session';
import { processPendingJobs } from '@/lib/jobs';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${getCronSecret()}`;

    if (authHeader !== expectedAuth) {
      return jsonError(request, 'Unauthorized.', 401);
    }

    const [expiredSessionsDeleted, jobResult] = await Promise.all([
      cleanupExpiredSessions(),
      processPendingJobs(),
    ]);

    logger.info('Cron maintenance completed', {
      expiredSessionsDeleted,
      jobResult,
    });

    return jsonSuccess(request, {
      success: true,
      expiredSessionsDeleted,
      jobs: jobResult,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/cron' });
  }
}
