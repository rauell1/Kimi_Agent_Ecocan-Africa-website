import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_CONFIG } from '@/lib/config';
import { env, getSessionSecret } from '@/lib/env';
import { ApiError, getClientIp } from '@/lib/api';
import { logger } from '@/lib/logger';
import { generateSecureToken } from '@/lib/security';

const userSessionSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone: true,
  avatar: true,
  subscriptionPlan: true,
  subscriptionExpiry: true,
  hasPaidAccess: true,
  accessPermissions: true,
  securityLevel: true,
  isBlocked: true,
  isApproved: true,
  isEmailVerified: true,
} as const;

export type SessionUserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  phone: string | null;
  avatar: string | null;
  subscriptionPlan: string;
  subscriptionExpiry: Date | null;
  hasPaidAccess: boolean;
  accessPermissions: string;
  securityLevel: string | null;
  isBlocked: boolean;
  isApproved: boolean;
  isEmailVerified: boolean;
};

export type AuthenticatedSession = {
  sessionId: string;
  token: string;
  user: SessionUserRecord;
  expiresAt: Date;
};

function hashSessionToken(token: string) {
  return createHash('sha256')
    .update(`${token}:${getSessionSecret()}`)
    .digest('hex');
}

export function attachSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(env.SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}

export async function createSessionForUser(userId: string, request: NextRequest) {
  const token = generateSecureToken(64);
  const expiresAt = new Date(Date.now() + SESSION_CONFIG.durationMs);

  await db.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent')?.slice(0, 255) || null,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function invalidateSessionByToken(token: string | undefined) {
  if (!token) {
    return;
  }

  await db.session.deleteMany({
    where: {
      tokenHash: hashSessionToken(token),
    },
  });
}

export async function getAuthenticatedSession(request: NextRequest): Promise<AuthenticatedSession | null> {
  const rawToken = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await db.session.findUnique({
    where: {
      tokenHash: hashSessionToken(rawToken),
    },
    include: {
      user: {
        select: userSessionSelect,
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  if (session.user.isBlocked || (session.user.role === 'EMPLOYEE' && !session.user.isApproved)) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  const nextExpiration = new Date(Date.now() + SESSION_CONFIG.durationMs);
  const shouldRefresh = session.expiresAt.getTime() - Date.now() < SESSION_CONFIG.refreshThresholdMs;

  if (shouldRefresh) {
    await db.session.update({
      where: { id: session.id },
      data: {
        expiresAt: nextExpiration,
        lastAccessedAt: new Date(),
      },
    });
  } else {
    await db.session.update({
      where: { id: session.id },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }

  return {
    sessionId: session.id,
    token: rawToken,
    user: session.user,
    expiresAt: shouldRefresh ? nextExpiration : session.expiresAt,
  };
}

export async function requireAuthenticatedSession(request: NextRequest) {
  const session = await getAuthenticatedSession(request);

  if (!session) {
    throw new ApiError(401, 'Authentication required');
  }

  return session;
}

export async function cleanupExpiredSessions() {
  const result = await db.session.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
    },
  });

  logger.info('Expired sessions cleaned up', { deletedCount: result.count });
  return result.count;
}
