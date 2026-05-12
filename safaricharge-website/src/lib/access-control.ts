import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/api';
import { requireAuthenticatedSession } from '@/lib/session';

export async function requireUser(request: NextRequest) {
  return requireAuthenticatedSession(request);
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const session = await requireAuthenticatedSession(request);

  if (!allowedRoles.includes(session.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }

  return session;
}

export async function requireAdminUser(request: NextRequest) {
  return requireRole(request, ['ADMIN']);
}

export async function requireFleetAccess(request: NextRequest) {
  return requireRole(request, ['ADMIN', 'EMPLOYEE', 'FLEET_MANAGER']);
}
