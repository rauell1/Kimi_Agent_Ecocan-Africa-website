import { NextRequest } from 'next/server';
import { RATE_LIMIT_CONFIG } from '@/lib/config';
import { type EmailJobPayload, sendTransactionalEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { getClientIp, handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { requireAdminUser } from '@/lib/access-control';
import { checkRateLimit } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const hasInternalAccess = Boolean(env.CRON_SECRET) && authHeader === `Bearer ${env.CRON_SECRET}`;

    if (!hasInternalAccess) {
      await requireAdminUser(request);
    }

    const rateLimit = checkRateLimit(
      `email:${getClientIp(request)}`,
      RATE_LIMIT_CONFIG.email.limit,
      RATE_LIMIT_CONFIG.email.windowMs
    );

    if (rateLimit.limited) {
      return jsonError(request, 'Too many email requests. Please try again later.', 429, {
        retryAfterSeconds: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const payload = (await request.json()) as EmailJobPayload;

    if (!payload?.type || !payload?.to) {
      return jsonError(request, 'Missing required email fields.', 400);
    }

    const deliveryResult = await sendTransactionalEmail(payload);
    return jsonSuccess(request, {
      success: true,
      ...deliveryResult,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/email' });
  }
}
