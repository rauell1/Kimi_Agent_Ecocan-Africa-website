import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { createPaginationMeta, handleRouteError, jsonSuccess, parsePagination } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search')?.trim();
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.UserWhereInput = {
      role: 'EMPLOYEE',
      ...(status === 'pending' ? { isApproved: false } : {}),
      ...(status === 'approved' ? { isApproved: true } : {}),
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

    const [employees, total, pending, approved] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isApproved: true,
          securityLevel: true,
          requestedRole: true,
          createdAt: true,
          approvedAt: true,
          approvedBy: true,
          isBlocked: true,
          accessPermissions: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.user.count({ where }),
      db.user.count({ where: { role: 'EMPLOYEE', isApproved: false } }),
      db.user.count({ where: { role: 'EMPLOYEE', isApproved: true } }),
    ]);

    return jsonSuccess(request, {
      success: true,
      employees,
      stats: {
        total,
        pending,
        approved,
      },
      pagination: createPaginationMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/employees' });
  }
}
