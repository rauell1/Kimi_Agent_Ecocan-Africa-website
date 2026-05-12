import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonSuccess, parsePagination, createPaginationMeta } from '@/lib/api';

const validRoles = new Set(['DRIVER', 'ADMIN', 'FLEET_MANAGER', 'EMPLOYEE'] as const);
type UserRoleFilter = 'DRIVER' | 'ADMIN' | 'FLEET_MANAGER' | 'EMPLOYEE';

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const { searchParams } = new URL(request.url);
    const requestedRole = searchParams.get('role');
    const role: UserRoleFilter | null =
      requestedRole && requestedRole !== 'all' && validRoles.has(requestedRole as never)
        ? (requestedRole as UserRoleFilter)
        : null;
    const search = searchParams.get('search')?.trim();
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [users, total, drivers, admins, fleetManagers, employees, blocked] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          avatar: true,
          isEmailVerified: true,
          isApproved: true,
          isBlocked: true,
          securityLevel: true,
          subscriptionPlan: true,
          subscriptionExpiry: true,
          hasPaidAccess: true,
          accessPermissions: true,
          createdAt: true,
          blockedAt: true,
          blockReason: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.user.count({ where }),
      db.user.count({ where: { role: 'DRIVER' } }),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({ where: { role: 'FLEET_MANAGER' } }),
      db.user.count({ where: { role: 'EMPLOYEE' } }),
      db.user.count({ where: { isBlocked: true } }),
    ]);

    return jsonSuccess(request, {
      success: true,
      users,
      stats: {
        total,
        drivers,
        admins,
        fleetManagers,
        employees,
        blocked,
      },
      pagination: createPaginationMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/users' });
  }
}
