import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

const rejectEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const adminSession = await requireAdminUser(request);
    const parsedBody = rejectEmployeeSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid rejection payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const employee = await db.user.findUnique({
      where: { id: parsedBody.data.employeeId },
    });

    if (!employee) {
      return jsonError(request, 'Employee not found.', 404);
    }

    if (employee.role !== 'EMPLOYEE') {
      return jsonError(request, 'User is not an employee.', 400);
    }

    if (employee.isApproved) {
      return jsonError(request, 'Approved employees cannot be rejected through this endpoint.', 400);
    }

    await db.user.delete({
      where: { id: parsedBody.data.employeeId },
    });

    logger.info('Employee application rejected', {
      actorUserId: adminSession.user.id,
      employeeId: employee.id,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'Employee application rejected.',
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/employees/reject' });
  }
}
