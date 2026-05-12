import { NextRequest } from 'next/server';
import { formatUserResponse } from '@/lib/auth';
import { RATE_LIMIT_CONFIG } from '@/lib/config';
import { db } from '@/lib/db';
import { getClientIp, handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { attachSessionCookie, createSessionForUser } from '@/lib/session';
import { checkRateLimit, sanitizeEmail } from '@/lib/security';
import { verifyCodeSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIp(request);
    const rateLimit = checkRateLimit(
      `auth:verify:${ipAddress}`,
      RATE_LIMIT_CONFIG.authVerify.limit,
      RATE_LIMIT_CONFIG.authVerify.windowMs
    );

    if (rateLimit.limited) {
      return jsonError(request, 'Too many verification attempts. Please try again later.', 429, {
        retryAfterSeconds: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const parsedBody = verifyCodeSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid verification payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const { code, userId } = parsedBody.data;
    const email = parsedBody.data.email ? sanitizeEmail(parsedBody.data.email) : undefined;

    const user = await db.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(userId ? [{ id: userId }] : []),
        ],
      },
    });

    if (!user) {
      return jsonError(request, 'User not found.', 404);
    }

    if (user.isBlocked) {
      return jsonError(request, 'Your account has been blocked. Contact support for assistance.', 403);
    }

    if (user.verificationCode !== code) {
      return jsonError(request, 'Invalid verification code.', 400);
    }

    if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
      return jsonError(request, 'Verification code has expired. Please request a new one.', 400);
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    const session = await createSessionForUser(updatedUser.id, request);
    const response = jsonSuccess(request, {
      success: true,
      message: 'Verification successful.',
      user: formatUserResponse(updatedUser),
    });

    attachSessionCookie(response, session.token, session.expiresAt);
    logger.info('User verified and session created', { userId: updatedUser.id, email: updatedUser.email });
    return response;
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/auth/verify' });
  }
}
