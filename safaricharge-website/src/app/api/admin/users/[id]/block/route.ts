import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { blockUserSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminUser(request);
    const { id } = await params;
    const parsedBody = blockUserSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid block payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    if (adminSession.user.id === id) {
      return jsonError(request, 'You cannot block your own account.', 400);
    }

    const user = await db.user.findUnique({ where: { id } });

    if (!user) {
      return jsonError(request, 'User not found.', 404);
    }

    if (user.isBlocked) {
      return jsonError(request, 'User is already blocked.', 400);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        isBlocked: true,
        blockedAt: new Date(),
        blockedBy: adminSession.user.id,
        blockReason: parsedBody.data.reason || 'No reason provided.',
      },
    });

    logger.info('User blocked', {
      actorUserId: adminSession.user.id,
      targetUserId: updatedUser.id,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'User blocked successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isBlocked: updatedUser.isBlocked,
        blockedAt: updatedUser.blockedAt,
        blockReason: updatedUser.blockReason,
      },
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/users/[id]/block' });
  }
}
