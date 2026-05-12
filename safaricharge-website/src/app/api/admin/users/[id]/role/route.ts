import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { roleSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

function getRoleDefaults(role: 'DRIVER' | 'ADMIN' | 'FLEET_MANAGER' | 'EMPLOYEE') {
  switch (role) {
    case 'ADMIN':
      return {
        subscriptionPlan: 'ENTERPRISE',
        hasPaidAccess: true,
        accessPermissions: 'charging_map,battery_toolkit,analytics,user_management,fleet_management',
        isApproved: true,
      };
    case 'EMPLOYEE':
      return {
        hasPaidAccess: true,
        accessPermissions: 'charging_map,battery_toolkit,analytics,fleet_management',
      };
    case 'FLEET_MANAGER':
      return {
        subscriptionPlan: 'ENTERPRISE',
        hasPaidAccess: true,
        accessPermissions: 'charging_map,fleet_management',
      };
    default:
      return {
        subscriptionPlan: 'FREE',
        hasPaidAccess: false,
        accessPermissions: 'charging_map',
      };
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminUser(request);
    const { id } = await params;
    const parsedBody = roleSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid role payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    if (adminSession.user.id === id && parsedBody.data.role !== 'ADMIN') {
      return jsonError(request, 'You cannot remove your own admin role.', 400);
    }

    const user = await db.user.findUnique({ where: { id } });

    if (!user) {
      return jsonError(request, 'User not found.', 404);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        role: parsedBody.data.role,
        ...getRoleDefaults(parsedBody.data.role),
      },
    });

    logger.info('User role updated', {
      actorUserId: adminSession.user.id,
      targetUserId: updatedUser.id,
      newRole: updatedUser.role,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'Role updated successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/users/[id]/role' });
  }
}
