import { z } from 'zod';
import { PAGINATION_CONFIG, SECURITY_CONFIG, STATION_QUERY_CONFIG } from '@/lib/config';

const trimmedString = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength);

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(SECURITY_CONFIG.passwordMaxLength),
});

export const registerSchema = z.object({
  name: trimmedString(SECURITY_CONFIG.maxNameLength),
  email: z.string().trim().email(),
  phone: z.string().trim().max(SECURITY_CONFIG.maxPhoneLength).optional().nullable(),
  password: z.string().min(SECURITY_CONFIG.passwordMinLength).max(SECURITY_CONFIG.passwordMaxLength),
  accountType: z.enum(['PUBLIC', 'EMPLOYEE', 'FLEET']).default('PUBLIC'),
});

export const verifyCodeSchema = z.object({
  email: z.string().trim().email().optional(),
  userId: z.string().trim().min(1).optional(),
  code: z.string().trim().regex(/^\d{6}$/),
});

export const roleSchema = z.object({
  role: z.enum(['DRIVER', 'ADMIN', 'FLEET_MANAGER', 'EMPLOYEE']),
});

export const securityLevelSchema = z.object({
  securityLevel: z.enum(['BASIC', 'STANDARD', 'ELEVATED', 'MANAGER', 'SUPERVISOR']),
});

export const blockUserSchema = z.object({
  reason: z.string().trim().max(SECURITY_CONFIG.maxReasonLength).optional(),
});

export const createFleetSchema = z.object({
  name: trimmedString(120),
  description: z.string().trim().max(300).optional().nullable(),
  category: z.enum(['TAXI', 'DELIVERY', 'CORPORATE', 'PUBLIC_TRANSPORT', 'RENTAL', 'PERSONAL', 'OTHER']).default('PERSONAL'),
  contactEmail: z.string().trim().email().optional().nullable(),
  contactPhone: z.string().trim().max(SECURITY_CONFIG.maxPhoneLength).optional().nullable(),
  address: z.string().trim().max(150).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
});

export const createFleetVehicleSchema = z.object({
  fleetId: z.string().trim().min(1),
  plateNumber: trimmedString(20),
  make: z.string().trim().max(60).optional().nullable(),
  model: z.string().trim().max(60).optional().nullable(),
  year: z.number().int().min(1990).max(2100).optional().nullable(),
  vin: z.string().trim().max(64).optional().nullable(),
  color: z.string().trim().max(40).optional().nullable(),
  batteryCapacity: z.number().min(0).max(500).optional().nullable(),
  maxRange: z.number().min(0).max(2000).optional().nullable(),
  assignedDriver: z.string().trim().max(100).optional().nullable(),
});

export const updateFleetVehicleSchema = z.object({
  vehicleId: z.string().trim().min(1),
  make: z.string().trim().max(60).optional().nullable(),
  model: z.string().trim().max(60).optional().nullable(),
  year: z.number().int().min(1990).max(2100).optional().nullable(),
  vin: z.string().trim().max(64).optional().nullable(),
  color: z.string().trim().max(40).optional().nullable(),
  batteryCapacity: z.number().min(0).max(500).optional().nullable(),
  maxRange: z.number().min(0).max(2000).optional().nullable(),
  status: z.enum(['ACTIVE', 'CHARGING', 'MAINTENANCE', 'OFFLINE']).optional(),
  assignedDriver: z.string().trim().max(100).optional().nullable(),
  currentBatteryLevel: z.number().min(0).max(100).optional().nullable(),
});

export const createSessionSchema = z.object({
  stationId: z.string().trim().min(1),
  connectorId: z.string().trim().min(1),
});

export const completeSessionSchema = z.object({
  sessionId: z.string().trim().min(1),
  energyDelivered: z.number().min(0).max(5000).optional().nullable(),
  cost: z.number().min(0).max(100000).optional().nullable(),
});

export const stationMutationSchema = z.object({
  name: trimmedString(120),
  description: z.string().trim().max(300).optional().nullable(),
  address: trimmedString(150),
  city: trimmedString(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  amenities: z.array(z.string().trim().max(40)).optional(),
  connectors: z
    .array(
      z.object({
        type: z.enum(['CCS2', 'CHADEMO', 'TYPE2', 'TESLA']),
        powerOutput: z.number().min(0).max(1000),
        currentPrice: z.number().min(0).max(10000),
        status: z.enum(['AVAILABLE', 'OCCUPIED', 'OFFLINE', 'MAINTENANCE']).optional(),
      })
    )
    .default([]),
});


export const stationQuerySchema = z
  .object({
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'OFFLINE', 'MAINTENANCE', 'all']).optional(),
    connectorType: z.enum(['CCS2', 'CHADEMO', 'TYPE2', 'TESLA', 'all']).optional(),
    search: z.string().trim().max(STATION_QUERY_CONFIG.maxSearchLength).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radius: z.coerce.number().min(STATION_QUERY_CONFIG.minRadiusKm).max(STATION_QUERY_CONFIG.maxRadiusKm).default(STATION_QUERY_CONFIG.defaultRadiusKm),
    page: z.coerce.number().int().min(1).default(PAGINATION_CONFIG.defaultPage),
    pageSize: z.coerce.number().int().min(1).max(PAGINATION_CONFIG.maxPageSize).default(PAGINATION_CONFIG.defaultPageSize),
  })
  .superRefine((value, ctx) => {
    const hasLat = typeof value.lat === 'number';
    const hasLng = typeof value.lng === 'number';

    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lat'],
        message: 'lat and lng must be provided together.',
      });
    }
  })
  .transform((value) => ({
    ...value,
    lat: value.lat ?? null,
    lng: value.lng ?? null,
    search: value.search ? value.search.trim() : null,
  }));
