import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminUser(request);
    const { id } = await params;

    if (adminSession.user.id === id) {
      return jsonError(request, 'You cannot delete your own account.', 400);
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return jsonError(request, 'User not found.', 404);
    }

    const activeSessions = await db.chargingSession.count({
      where: {
        userId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSessions > 0) {
      return jsonError(request, 'Cannot delete a user with active charging sessions.', 409);
    }

    await db.user.delete({
      where: { id },
    });

    logger.info('User deleted by admin', {
      actorUserId: adminSession.user.id,
      targetUserId: id,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/users/[id]' });
  }
}
