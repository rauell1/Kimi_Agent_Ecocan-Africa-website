import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdminUser } from '@/lib/access-control';
import { db } from '@/lib/db';
import { enqueueEmailJob } from '@/lib/jobs';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

const approveEmployeeSchema = z.object({
  employeeId: z.string().trim().min(1),
  securityLevel: z.enum(['BASIC', 'STANDARD', 'ELEVATED', 'MANAGER', 'SUPERVISOR']).default('BASIC'),
});

export async function POST(request: NextRequest) {
  try {
    const adminSession = await requireAdminUser(request);
    const parsedBody = approveEmployeeSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid approval payload.', 400, {
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
      return jsonError(request, 'Employee is already approved.', 400);
    }

    const updatedEmployee = await db.user.update({
      where: { id: parsedBody.data.employeeId },
      data: {
        isApproved: true,
        securityLevel: parsedBody.data.securityLevel,
        approvedBy: adminSession.user.id,
        approvedAt: new Date(),
        hasPaidAccess: true,
        accessPermissions: 'charging_map,battery_toolkit,analytics,fleet_management',
      },
    });

    await enqueueEmailJob({
      type: 'employee_approved',
      to: updatedEmployee.email,
      data: {
        name: updatedEmployee.name,
        securityLevel: updatedEmployee.securityLevel,
      },
    });

    logger.info('Employee approved', {
      actorUserId: adminSession.user.id,
      employeeId: updatedEmployee.id,
      securityLevel: updatedEmployee.securityLevel,
    });

    return jsonSuccess(request, {
      success: true,
      message: 'Employee approved successfully.',
      employee: {
        id: updatedEmployee.id,
        email: updatedEmployee.email,
        name: updatedEmployee.name,
        securityLevel: updatedEmployee.securityLevel,
        approvedAt: updatedEmployee.approvedAt,
      },
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/admin/employees/approve' });
  }
}
