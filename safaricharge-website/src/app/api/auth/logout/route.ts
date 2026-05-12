import { NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { handleRouteError, jsonSuccess } from '@/lib/api';
import { clearSessionCookie, invalidateSessionByToken } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
    await invalidateSessionByToken(sessionToken);

    const response = jsonSuccess(request, {
      success: true,
      message: 'Logged out successfully.',
    });

    clearSessionCookie(response);
    return response;
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/auth/logout' });
  }
}
