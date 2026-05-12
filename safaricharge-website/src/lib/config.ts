import { env } from '@/lib/env';

export const APP_CONFIG = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION,
  url: env.NEXT_PUBLIC_APP_URL,
  allowedOrigins: env.ALLOWED_ORIGIN_LIST,
} as const;

export const SESSION_CONFIG = {
  cookieName: env.SESSION_COOKIE_NAME,
  durationMs: 1000 * 60 * 60 * 24 * 7,
  refreshThresholdMs: 1000 * 60 * 60 * 24,
  verificationCodeExpiryMinutes: 10,
  passwordResetExpiryMinutes: 30,
} as const;

export const SECURITY_CONFIG = {
  passwordMinLength: 10,
  passwordMaxLength: 128,
  verificationCodeLength: 6,
  maxSearchLength: 100,
  maxNameLength: 100,
  maxPhoneLength: 20,
  maxReasonLength: 250,
  maxNotesLength: 1000,
} as const;

export const RATE_LIMIT_CONFIG = {
  authLogin: { limit: 5, windowMs: 1000 * 60 * 15 },
  authRegister: { limit: 5, windowMs: 1000 * 60 * 30 },
  authVerify: { limit: 10, windowMs: 1000 * 60 * 15 },
  email: { limit: 10, windowMs: 1000 * 60 * 15 },
  adminMutation: { limit: 30, windowMs: 1000 * 60 * 15 },
  generalMutation: { limit: 60, windowMs: 1000 * 60 * 15 },
} as const;

export const PAGINATION_CONFIG = {
  defaultPage: 1,
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const JOB_CONFIG = {
  maxAttempts: 3,
  batchSize: 10,
  retryDelayMs: 1000 * 60 * 5,
} as const;


export const STATION_QUERY_CONFIG = {
  defaultRadiusKm: 50,
  maxRadiusKm: 500,
  minRadiusKm: 1,
  geoCandidateMultiplier: 5,
  maxGeoCandidates: 500,
  maxSearchLength: 100,
} as const;
