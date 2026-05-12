import { z } from 'zod';

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1).default('file:./db/safaricharge.db'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('SafariCharge'),
  NEXT_PUBLIC_APP_VERSION: z.string().min(1).default('1.0.0'),
  MAIN_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@rauell.systems'),
  CRON_SECRET: z.string().optional(),
  SESSION_SECRET: z.string().default('development-session-secret-change-me'),
  SESSION_COOKIE_NAME: z.string().min(1).default('safaricharge_session'),
  ALLOWED_ORIGINS: z.string().optional(),
  ENABLE_DEMO_USERS: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

const parsedEnv = rawEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration: ${parsedEnv.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')}`
  );
}

const envData = parsedEnv.data;
const DEFAULT_SESSION_SECRET = 'development-session-secret-change-me';
const isProduction = envData.NODE_ENV === 'production';

const allowedOrigins = (envData.ALLOWED_ORIGINS || envData.NEXT_PUBLIC_APP_URL)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  ...envData,
  ENABLE_DEMO_USERS: envData.ENABLE_DEMO_USERS ?? false,
  ALLOWED_ORIGIN_LIST: allowedOrigins,
} as const;

export type AppEnv = typeof env;

export function getSessionSecret() {
  if (isProduction && envData.SESSION_SECRET === DEFAULT_SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set to a strong production value.');
  }

  return envData.SESSION_SECRET;
}

export function getCronSecret() {
  if (!envData.CRON_SECRET) {
    throw new Error('CRON_SECRET must be configured before calling protected cron operations.');
  }

  return envData.CRON_SECRET;
}
