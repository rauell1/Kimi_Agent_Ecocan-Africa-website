import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireFleetAccess, requireUser } from '@/lib/access-control';
import { createFleetSchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { createPaginationMeta, handleRouteError, jsonError, jsonSuccess, parsePagination } from '@/lib/api';
import { logger } from '@/lib/logger';

function canReadAllFleets(role: string) {
  return role === 'ADMIN' || role === 'EMPLOYEE';
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.FleetWhereInput = canReadAllFleets(session.user.role)
      ? {}
      : {
          ownerId: session.user.id,
        };

    const [fleets, total, categoryCounts, stats] = await Promise.all([
      db.fleet.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          _count: {
            select: { vehicles: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      db.fleet.count({ where }),
      db.fleet.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
      }),
      db.fleet.aggregate({
        where,
        _count: { id: true },
        _sum: { totalVehicles: true, totalEnergy: true, totalDistance: true },
      }),
    ]);

    return jsonSuccess(request, {
      success: true,
      fleets,
      stats: {
        totalFleets: stats._count.id,
        totalVehicles: stats._sum.totalVehicles || 0,
        totalEnergy: stats._sum.totalEnergy || 0,
        totalDistance: stats._sum.totalDistance || 0,
        categoryCounts,
      },
      pagination: createPaginationMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);

    if (!['FLEET_MANAGER', 'ADMIN'].includes(session.user.role)) {
      return jsonError(request, 'Only fleet managers can create fleets.', 403);
    }

    const parsedBody = createFleetSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid fleet payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const existingFleet = await db.fleet.findFirst({
      where: { ownerId: session.user.id },
    });

    if (existingFleet) {
      return jsonError(request, 'This user already has a fleet.', 409, {
        fleetId: existingFleet.id,
      });
    }

    const fleet = await db.fleet.create({
      data: {
        ...parsedBody.data,
        ownerId: session.user.id,
        contactEmail: parsedBody.data.contactEmail || session.user.email,
        contactPhone: parsedBody.data.contactPhone || session.user.phone,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    logger.info('Fleet created', { ownerId: session.user.id, fleetId: fleet.id });

    return jsonSuccess(
      request,
      {
        success: true,
        fleet,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet' });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const body = (await request.json()) as { fleetId?: string } & Record<string, unknown>;
    const fleetId = typeof body.fleetId === 'string' ? body.fleetId : undefined;

    if (!fleetId) {
      return jsonError(request, 'Fleet ID is required.', 400);
    }

    const existingFleet = await db.fleet.findUnique({
      where: { id: fleetId },
    });

    if (!existingFleet) {
      return jsonError(request, 'Fleet not found.', 404);
    }

    const canManageFleet = canReadAllFleets(session.user.role) || existingFleet.ownerId === session.user.id;
    if (!canManageFleet) {
      return jsonError(request, 'You do not have permission to update this fleet.', 403);
    }

    const parsedBody = createFleetSchema.partial().safeParse(body);
    if (!parsedBody.success) {
      return jsonError(request, 'Invalid fleet update payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const fleet = await db.fleet.update({
      where: { id: fleetId },
      data: parsedBody.data,
    });

    return jsonSuccess(request, {
      success: true,
      fleet,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet' });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const fleetId = new URL(request.url).searchParams.get('fleetId');

    if (!fleetId) {
      return jsonError(request, 'Fleet ID is required.', 400);
    }

    const fleet = await db.fleet.findUnique({
      where: { id: fleetId },
    });

    if (!fleet) {
      return jsonError(request, 'Fleet not found.', 404);
    }

    const canDeleteFleet = canReadAllFleets(session.user.role) || fleet.ownerId === session.user.id;
    if (!canDeleteFleet) {
      return jsonError(request, 'You do not have permission to delete this fleet.', 403);
    }

    await db.fleet.delete({
      where: { id: fleetId },
    });

    logger.info('Fleet deleted', { actorUserId: session.user.id, fleetId });

    return jsonSuccess(request, {
      success: true,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet' });
  }
}
