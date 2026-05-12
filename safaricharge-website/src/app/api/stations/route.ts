import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { RATE_LIMIT_CONFIG, STATION_QUERY_CONFIG } from '@/lib/config';
import { requireRole } from '@/lib/access-control';
import { stationMutationSchema, stationQuerySchema } from '@/lib/validation';
import { db } from '@/lib/db';
import { getClientIp, handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import { checkRateLimit } from '@/lib/security';

const validStationStatuses = new Set(['AVAILABLE', 'OCCUPIED', 'OFFLINE', 'MAINTENANCE'] as const);
const validConnectorTypes = new Set(['CCS2', 'CHADEMO', 'TYPE2', 'TESLA'] as const);
type StationStatusFilter = 'AVAILABLE' | 'OCCUPIED' | 'OFFLINE' | 'MAINTENANCE';
type ConnectorTypeFilter = 'CCS2' | 'CHADEMO' | 'TYPE2' | 'TESLA';

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getBoundingBox(latitude: number, longitude: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - lngDelta,
    maxLng: longitude + lngDelta,
  };
}

function buildStationWhere(params: {
  status: StationStatusFilter | null;
  connectorType: ConnectorTypeFilter | null;
  search: string | null;
  lat: number | null;
  lng: number | null;
  radius: number;
}) {
  const baseWhere: Prisma.ChargingStationWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search } },
            { city: { contains: params.search } },
            { address: { contains: params.search } },
          ],
        }
      : {}),
    ...(params.connectorType
      ? {
          connectors: {
            some: {
              type: params.connectorType,
            },
          },
        }
      : {}),
  };

  if (params.lat === null || params.lng === null) {
    return baseWhere;
  }

  const { minLat, maxLat, minLng, maxLng } = getBoundingBox(params.lat, params.lng, params.radius);

  return {
    ...baseWhere,
    latitude: { gte: minLat, lte: maxLat },
    longitude: { gte: minLng, lte: maxLng },
  } satisfies Prisma.ChargingStationWhereInput;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = stationQuerySchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      connectorType: searchParams.get('connectorType') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      lat: searchParams.get('lat') ?? undefined,
      lng: searchParams.get('lng') ?? undefined,
      radius: searchParams.get('radius') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    if (!parsedQuery.success) {
      return jsonError(request, 'Invalid query parameters.', 400, {
        issues: parsedQuery.error.flatten(),
      });
    }

    const params = parsedQuery.data;
    const status: StationStatusFilter | null =
      params.status && params.status !== 'all' && validStationStatuses.has(params.status as never)
        ? (params.status as StationStatusFilter)
        : null;
    const connectorType: ConnectorTypeFilter | null =
      params.connectorType &&
      params.connectorType !== 'all' &&
      validConnectorTypes.has(params.connectorType as never)
        ? (params.connectorType as ConnectorTypeFilter)
        : null;

    const where = buildStationWhere({
      status,
      connectorType,
      search: params.search ?? null,
      lat: params.lat ?? null,
      lng: params.lng ?? null,
      radius: params.radius,
    });

    if (params.lat !== null && params.lng !== null) {
      const candidateTake = Math.min(
        params.pageSize * STATION_QUERY_CONFIG.geoCandidateMultiplier,
        STATION_QUERY_CONFIG.maxGeoCandidates
      );

      const [totalCandidates, candidates] = await Promise.all([
        db.chargingStation.count({ where }),
        db.chargingStation.findMany({
          where,
          include: { connectors: true },
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
          take: candidateTake,
        }),
      ]);

      const withinRadius = candidates
        .map((station) => ({
          ...station,
          distance: calculateDistanceKm(params.lat!, params.lng!, station.latitude, station.longitude),
        }))
        .filter((station) => station.distance <= params.radius)
        .sort((left, right) => left.distance - right.distance);

      const start = (params.page - 1) * params.pageSize;
      const stations = withinRadius.slice(start, start + params.pageSize);

      return jsonSuccess(request, {
        success: true,
        stations,
        pagination: {
          total: withinRadius.length,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: Math.ceil(withinRadius.length / params.pageSize),
          candidateTotal: totalCandidates,
          candidateWindow: candidateTake,
        },
      });
    }

    const [total, stations] = await Promise.all([
      db.chargingStation.count({ where }),
      db.chargingStation.findMany({
        where,
        include: { connectors: true },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
    ]);

    return jsonSuccess(request, {
      success: true,
      stations,
      pagination: {
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
      },
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/stations' });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ['ADMIN', 'EMPLOYEE']);

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(
      `stations:create:${clientIp}`,
      RATE_LIMIT_CONFIG.generalMutation.limit,
      RATE_LIMIT_CONFIG.generalMutation.windowMs
    );

    if (rateLimit.limited) {
      return jsonError(request, 'Too many station creation attempts. Please try again later.', 429, {
        resetTime: rateLimit.resetTime,
      });
    }

    const parsedBody = stationMutationSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid station payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const station = await db.chargingStation.create({
      data: {
        name: parsedBody.data.name,
        description: parsedBody.data.description,
        address: parsedBody.data.address,
        city: parsedBody.data.city,
        latitude: parsedBody.data.latitude,
        longitude: parsedBody.data.longitude,
        amenities: parsedBody.data.amenities ? JSON.stringify(parsedBody.data.amenities) : null,
        connectors: {
          create: parsedBody.data.connectors.map((connector) => ({
            type: connector.type,
            powerOutput: connector.powerOutput,
            currentPrice: connector.currentPrice,
            status: connector.status || 'AVAILABLE',
          })),
        },
      },
      include: {
        connectors: true,
      },
    });

    return jsonSuccess(
      request,
      {
        success: true,
        station,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/stations' });
  }
}
