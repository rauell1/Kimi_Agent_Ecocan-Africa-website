import { NextRequest } from 'next/server';
import { formatUserResponse, generateVerificationCode, verifyPassword } from '@/lib/auth';
import { RATE_LIMIT_CONFIG } from '@/lib/config';
import { db } from '@/lib/db';
import { enqueueEmailJob } from '@/lib/jobs';
import { ApiError, getClientIp, handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { attachSessionCookie, createSessionForUser } from '@/lib/session';
import { checkRateLimit, clearRateLimit, getVerificationCodeExpiry, sanitizeEmail } from '@/lib/security';
import { loginSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIp(request);
    const rateLimit = checkRateLimit(
      `auth:login:${ipAddress}`,
      RATE_LIMIT_CONFIG.authLogin.limit,
      RATE_LIMIT_CONFIG.authLogin.windowMs
    );

    if (rateLimit.limited) {
      return jsonError(request, 'Too many login attempts. Please try again later.', 429, {
        retryAfterSeconds: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const parsedBody = loginSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid login payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const sanitizedEmail = sanitizeEmail(parsedBody.data.email);
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user || !user.password || !verifyPassword(parsedBody.data.password, user.password)) {
      return jsonError(request, 'Invalid email or password.', 401);
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked. Contact support for assistance.');
    }

    if (user.role === 'EMPLOYEE' && !user.isApproved) {
      throw new ApiError(403, 'Your employee account is pending approval.');
    }

    if (user.isEmailVerified) {
      clearRateLimit(`auth:login:${ipAddress}`);

      const session = await createSessionForUser(user.id, request);
      const response = jsonSuccess(request, {
        success: true,
        message: 'Login successful.',
        skipVerification: true,
        user: formatUserResponse(user),
      });

      attachSessionCookie(response, session.token, session.expiresAt);
      logger.info('User logged in', { userId: user.id, email: user.email, ipAddress });
      return response;
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = getVerificationCodeExpiry();

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiry,
      },
    });

    await enqueueEmailJob({
      type: 'verification',
      to: user.email,
      data: {
        code: verificationCode,
        name: user.name || 'User',
      },
    });

    logger.info('Verification code queued for login', { userId: user.id, email: user.email });

    return jsonSuccess(request, {
      success: true,
      message: 'Verification code sent to your email.',
      userId: user.id,
      email: user.email,
      requiresVerification: true,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/auth/login' });
  }
}
