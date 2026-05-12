import { NextRequest } from 'next/server';
import { z } from 'zod';
import { RATE_LIMIT_CONFIG } from '@/lib/config';
import { requireRole } from '@/lib/access-control';
import { db } from '@/lib/db';
import { getClientIp, handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { checkRateLimit } from '@/lib/security';
import { getVersionStore, rollbackToVersion } from '@/lib/versioning';

const rollbackSchema = z.object({
  targetVersionId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN']);
    const store = await getVersionStore(db);
    return jsonSuccess(request, { success: true, store });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/versioning' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN']);

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(
      `versioning:rollback:${clientIp}`,
      RATE_LIMIT_CONFIG.adminMutation.limit,
      RATE_LIMIT_CONFIG.adminMutation.windowMs
    );

    if (rateLimit.limited) {
      return jsonError(
        request,
        'Too many rollback attempts. Please wait before trying again.',
        429,
        { resetTime: rateLimit.resetTime }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = rollbackSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(request, 'Invalid rollback request.', 400, {
        issues: parsed.error.flatten(),
      });
    }

    const newVersion = await rollbackToVersion(
      db,
      parsed.data.targetVersionId,
      parsed.data.metadata ?? {}
    );
    const store = await getVersionStore(db);

    return jsonSuccess(request, {
      success: true,
      version: newVersion,
      store,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/versioning' });
  }
}
