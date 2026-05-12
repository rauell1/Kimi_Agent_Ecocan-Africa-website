import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { securityLevelSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminUser(request);
    const { id } = await params;
    const parsedBody = securityLevelSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid security level payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const employee = await db.user.findUnique({ where: { id } });

    if (!employee) {
      return jsonError(request, 'Employee not found.', 404);
    }

    if (employee.role !== 'EMPLOYEE') {
      return jsonError(request, 'User is not an employee.', 400);
    }

    const updatedEmployee = await db.user.update({
      where: { id },
      data: { securityLevel: parsedBody.data.securityLevel },
    });

    logger.info('Employee security level updated', {
      actorUserId: adminSession.user.id,
      employeeId: updatedEmployee.id,
      securityLevel: updatedEmployee.securityLevel,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'Security level updated.',
      employee: {
        id: updatedEmployee.id,
        email: updatedEmployee.email,
        securityLevel: updatedEmployee.securityLevel,
      },
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/employees/[id]/security' });
  }
}
