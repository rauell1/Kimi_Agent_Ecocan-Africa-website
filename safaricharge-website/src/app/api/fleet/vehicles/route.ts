import { NextRequest } from 'next/server';
import { requireFleetAccess } from '@/lib/access-control';
import { createFleetVehicleSchema, updateFleetVehicleSchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { logger } from '@/lib/logger';

function canManageFleet(role: string, ownerId: string, userId: string) {
  return role === 'ADMIN' || role === 'EMPLOYEE' || ownerId === userId;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const fleetId = new URL(request.url).searchParams.get('fleetId');

    if (!fleetId) {
      return jsonError(request, 'Fleet ID is required.', 400);
    }

    const fleet = await db.fleet.findUnique({
      where: { id: fleetId },
      select: { ownerId: true },
    });

    if (!fleet) {
      return jsonError(request, 'Fleet not found.', 404);
    }

    if (!canManageFleet(session.user.role, fleet.ownerId, session.user.id)) {
      return jsonError(request, 'You do not have access to this fleet.', 403);
    }

    const vehicles = await db.fleetVehicle.findMany({
      where: { fleetId },
      include: {
        _count: {
          select: { chargingSessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonSuccess(request, {
      success: true,
      vehicles,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet/vehicles' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const parsedBody = createFleetVehicleSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid vehicle payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const fleet = await db.fleet.findUnique({
      where: { id: parsedBody.data.fleetId },
      select: { ownerId: true },
    });

    if (!fleet) {
      return jsonError(request, 'Fleet not found.', 404);
    }

    if (!canManageFleet(session.user.role, fleet.ownerId, session.user.id)) {
      return jsonError(request, 'You do not have access to this fleet.', 403);
    }

    const existingVehicle = await db.fleetVehicle.findUnique({
      where: {
        fleetId_plateNumber: {
          fleetId: parsedBody.data.fleetId,
          plateNumber: parsedBody.data.plateNumber.toUpperCase(),
        },
      },
    });

    if (existingVehicle) {
      return jsonError(request, 'Vehicle with this plate number already exists in the fleet.', 409);
    }

    const vehicle = await db.$transaction(async (transaction) => {
      const createdVehicle = await transaction.fleetVehicle.create({
        data: {
          ...parsedBody.data,
          plateNumber: parsedBody.data.plateNumber.toUpperCase(),
          status: 'ACTIVE',
        },
      });

      await transaction.fleet.update({
        where: { id: parsedBody.data.fleetId },
        data: { totalVehicles: { increment: 1 } },
      });

      return createdVehicle;
    });

    logger.info('Fleet vehicle created', { actorUserId: session.user.id, vehicleId: vehicle.id });

    return jsonSuccess(
      request,
      {
        success: true,
        vehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet/vehicles' });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const parsedBody = updateFleetVehicleSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid vehicle update payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const existingVehicle = await db.fleetVehicle.findUnique({
      where: { id: parsedBody.data.vehicleId },
      include: {
        fleet: {
          select: { ownerId: true },
        },
      },
    });

    if (!existingVehicle) {
      return jsonError(request, 'Vehicle not found.', 404);
    }

    if (!canManageFleet(session.user.role, existingVehicle.fleet.ownerId, session.user.id)) {
      return jsonError(request, 'You do not have access to this fleet.', 403);
    }

    const vehicle = await db.fleetVehicle.update({
      where: { id: parsedBody.data.vehicleId },
      data: {
        make: parsedBody.data.make,
        model: parsedBody.data.model,
        year: parsedBody.data.year,
        vin: parsedBody.data.vin,
        color: parsedBody.data.color,
        batteryCapacity: parsedBody.data.batteryCapacity,
        maxRange: parsedBody.data.maxRange,
        status: parsedBody.data.status,
        assignedDriver: parsedBody.data.assignedDriver,
        currentBatteryLevel: parsedBody.data.currentBatteryLevel,
      },
    });

    return jsonSuccess(request, {
      success: true,
      vehicle,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet/vehicles' });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireFleetAccess(request);
    const vehicleId = new URL(request.url).searchParams.get('vehicleId');

    if (!vehicleId) {
      return jsonError(request, 'Vehicle ID is required.', 400);
    }

    const vehicle = await db.fleetVehicle.findUnique({
      where: { id: vehicleId },
      include: {
        fleet: {
          select: { ownerId: true },
        },
      },
    });

    if (!vehicle) {
      return jsonError(request, 'Vehicle not found.', 404);
    }

    if (!canManageFleet(session.user.role, vehicle.fleet.ownerId, session.user.id)) {
      return jsonError(request, 'You do not have access to this fleet.', 403);
    }

    await db.$transaction(async (transaction) => {
      await transaction.fleetVehicle.delete({
        where: { id: vehicleId },
      });

      await transaction.fleet.update({
        where: { id: vehicle.fleetId },
        data: { totalVehicles: { decrement: 1 } },
      });
    });

    logger.info('Fleet vehicle deleted', { actorUserId: session.user.id, vehicleId });

    return jsonSuccess(request, {
      success: true,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/fleet/vehicles' });
  }
}
