import { randomBytes } from 'crypto';
import { RATE_LIMIT_CONFIG, SECURITY_CONFIG, SESSION_CONFIG } from '@/lib/config';
import { env } from '@/lib/env';

export const MAIN_ADMIN_EMAIL = env.MAIN_ADMIN_EMAIL;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetTime: number;
};

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      limited: false,
      remaining: Math.max(limit - 1, 0),
      resetTime,
    };
  }

  if (record.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    limited: false,
    remaining: Math.max(limit - record.count, 0),
    resetTime: record.resetTime,
  };
}

export function isRateLimited(
  identifier: string,
  maxAttempts = RATE_LIMIT_CONFIG.generalMutation.limit,
  windowMs = RATE_LIMIT_CONFIG.generalMutation.windowMs
): boolean {
  return checkRateLimit(identifier, maxAttempts, windowMs).limited;
}

export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < SECURITY_CONFIG.passwordMinLength) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters`);
  }

  if (password.length > SECURITY_CONFIG.passwordMaxLength) {
    errors.push(`Password must be less than ${SECURITY_CONFIG.passwordMaxLength} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidPassword(password: string): boolean {
  return validatePassword(password).valid;
}

export function sanitizeString(input: string, maxLength: number = SECURITY_CONFIG.maxNotesLength): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .trim();
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

export function sanitizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+254') && cleaned.length === 13) {
    return cleaned;
  }
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+254${cleaned.slice(1)}`;
  }
  return phone.trim().slice(0, 20);
}

export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canAccessAdmin(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function canAccessEmployeeFeatures(userRole: string): boolean {
  return userRole === 'ADMIN' || userRole === 'EMPLOYEE';
}

export function canAccessFleet(userRole: string): boolean {
  return ['ADMIN', 'EMPLOYEE', 'FLEET_MANAGER'].includes(userRole);
}

export function generateSecureToken(length: number = 32): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  return `${data.slice(0, visibleChars)}${'*'.repeat(data.length - visibleChars * 2)}${data.slice(-visibleChars)}`;
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export function applySecurityHeaders(response: Response): Response {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function getVerificationCodeExpiry() {
  return new Date(Date.now() + SESSION_CONFIG.verificationCodeExpiryMinutes * 60 * 1000);
}

export function getPasswordResetExpiry() {
  return new Date(Date.now() + SESSION_CONFIG.passwordResetExpiryMinutes * 60 * 1000);
}

export function normalizePermissionList(accessPermissions: string | string[] | null | undefined): string[] {
  if (Array.isArray(accessPermissions)) {
    return accessPermissions.filter(Boolean);
  }

  if (!accessPermissions) {
    return [];
  }

  return accessPermissions
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean);
}
