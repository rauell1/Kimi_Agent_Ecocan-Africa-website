import { NextRequest } from 'next/server';
import { formatUserResponse } from '@/lib/auth';
import { handleRouteError, jsonSuccess } from '@/lib/api';
import { attachSessionCookie, requireAuthenticatedSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthenticatedSession(request);
    const response = jsonSuccess(request, {
      success: true,
      user: formatUserResponse(session.user),
    });

    attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/auth/me' });
  }
}
