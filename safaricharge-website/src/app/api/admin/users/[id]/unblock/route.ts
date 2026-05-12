import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminUser(request);
    const { id } = await params;

    const user = await db.user.findUnique({ where: { id } });

    if (!user) {
      return jsonError(request, 'User not found.', 404);
    }

    if (!user.isBlocked) {
      return jsonError(request, 'User is not blocked.', 400);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        isBlocked: false,
        blockedAt: null,
        blockedBy: null,
        blockReason: null,
      },
    });

    logger.info('User unblocked', {
      actorUserId: adminSession.user.id,
      targetUserId: updatedUser.id,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'User unblocked successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isBlocked: updatedUser.isBlocked,
      },
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/users/[id]/unblock' });
  }
}
