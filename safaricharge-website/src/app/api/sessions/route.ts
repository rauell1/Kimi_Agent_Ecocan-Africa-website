import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireUser } from '@/lib/access-control';
import { completeSessionSchema, createSessionSchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { createPaginationMeta, handleRouteError, jsonError, jsonSuccess, parsePagination } from '@/lib/api';

const validSessionStatuses = new Set(['ACTIVE', 'COMPLETED', 'CANCELLED'] as const);
type SessionStatusFilter = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

function canViewAnySessions(role: string) {
  return role === 'ADMIN' || role === 'EMPLOYEE';
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');
    const requestedStatus = searchParams.get('status');
    const status: SessionStatusFilter | null =
      requestedStatus && validSessionStatuses.has(requestedStatus as never)
        ? (requestedStatus as SessionStatusFilter)
        : null;
    const { page, pageSize, skip, take } = parsePagination(searchParams);

    const where: Prisma.ChargingSessionWhereInput = {
      ...(canViewAnySessions(session.user.role) ? {} : { userId: session.user.id }),
      ...(stationId ? { stationId } : {}),
      ...(status ? { status } : {}),
    };

    const [sessions, total] = await Promise.all([
      db.chargingSession.findMany({
        where,
        include: {
          station: {
            include: {
              connectors: true,
            },
          },
          connector: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
        skip,
        take,
      }),
      db.chargingSession.count({ where }),
    ]);

    return jsonSuccess(request, {
      success: true,
      sessions,
      pagination: createPaginationMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/sessions' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const parsedBody = createSessionSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid session payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const [connector, existingActiveSession] = await Promise.all([
      db.connector.findUnique({
        where: { id: parsedBody.data.connectorId },
      }),
      db.chargingSession.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
      }),
    ]);

    if (!connector || connector.stationId !== parsedBody.data.stationId) {
      return jsonError(request, 'Connector not found for the selected station.', 404);
    }

    if (connector.status !== 'AVAILABLE') {
      return jsonError(request, 'Connector is not currently available.', 409);
    }

    if (existingActiveSession) {
      return jsonError(request, 'You already have an active charging session.', 409);
    }

    const createdSession = await db.$transaction(async (transaction) => {
      await transaction.connector.update({
        where: { id: parsedBody.data.connectorId },
        data: { status: 'OCCUPIED' },
      });

      return transaction.chargingSession.create({
        data: {
          userId: session.user.id,
          stationId: parsedBody.data.stationId,
          connectorId: parsedBody.data.connectorId,
          status: 'ACTIVE',
        },
        include: {
          station: true,
          connector: true,
        },
      });
    });

    return jsonSuccess(
      request,
      {
        success: true,
        session: createdSession,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/sessions' });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authenticatedUser = await requireUser(request);
    const parsedBody = completeSessionSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid session update payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const existingSession = await db.chargingSession.findUnique({
      where: { id: parsedBody.data.sessionId },
      include: {
        connector: true,
      },
    });

    if (!existingSession) {
      return jsonError(request, 'Charging session not found.', 404);
    }

    const canManageSession =
      canViewAnySessions(authenticatedUser.user.role) || existingSession.userId === authenticatedUser.user.id;

    if (!canManageSession) {
      return jsonError(request, 'You do not have permission to update this session.', 403);
    }

    if (existingSession.status !== 'ACTIVE') {
      return jsonError(request, 'Only active sessions can be completed.', 400);
    }

    const updatedSession = await db.$transaction(async (transaction) => {
      await transaction.connector.update({
        where: { id: existingSession.connectorId },
        data: { status: 'AVAILABLE' },
      });

      return transaction.chargingSession.update({
        where: { id: parsedBody.data.sessionId },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
          energyDelivered: parsedBody.data.energyDelivered,
          cost: parsedBody.data.cost,
        },
        include: {
          station: true,
          connector: true,
        },
      });
    });

    return jsonSuccess(request, {
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/sessions' });
  }
}
