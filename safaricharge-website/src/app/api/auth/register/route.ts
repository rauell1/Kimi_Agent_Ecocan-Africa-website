import { NextRequest } from 'next/server';
import { generateVerificationCode, hashPasswordForStorage } from '@/lib/auth';
import { RATE_LIMIT_CONFIG } from '@/lib/config';
import { db } from '@/lib/db';
import { enqueueEmailJob } from '@/lib/jobs';
import { getClientIp, handleRouteError, jsonError, jsonSuccess } from '@/lib/api';
import {
  MAIN_ADMIN_EMAIL,
  checkRateLimit,
  getVerificationCodeExpiry,
  sanitizeEmail,
  sanitizePhone,
  sanitizeString,
  validatePassword,
} from '@/lib/security';
import { registerSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

type UserRole = 'DRIVER' | 'ADMIN' | 'FLEET_MANAGER' | 'EMPLOYEE';
type SecurityLevel = 'BASIC' | 'STANDARD' | 'ELEVATED' | 'MANAGER' | 'SUPERVISOR';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIp(request);
    const rateLimit = checkRateLimit(
      `auth:register:${ipAddress}`,
      RATE_LIMIT_CONFIG.authRegister.limit,
      RATE_LIMIT_CONFIG.authRegister.windowMs
    );

    if (rateLimit.limited) {
      return jsonError(request, 'Too many registration attempts. Please try again later.', 429, {
        retryAfterSeconds: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      });
    }

    const parsedBody = registerSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return jsonError(request, 'Invalid registration payload.', 400, {
        issues: parsedBody.error.flatten(),
      });
    }

    const sanitizedName = sanitizeString(parsedBody.data.name, 100);
    const sanitizedEmail = sanitizeEmail(parsedBody.data.email);
    const sanitizedPhone = parsedBody.data.phone ? sanitizePhone(parsedBody.data.phone) : null;

    const passwordValidation = validatePassword(parsedBody.data.password);
    if (!passwordValidation.valid) {
      return jsonError(request, passwordValidation.errors.join(' '), 400);
    }

    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return jsonError(request, 'An account with this email already exists.', 409);
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = getVerificationCodeExpiry();
    const hashedPassword = hashPasswordForStorage(parsedBody.data.password);

    const isMainAdmin = sanitizedEmail.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();

    let role: UserRole = 'DRIVER';
    let isApproved = true;
    let securityLevel: SecurityLevel | null = null;
    let subscriptionPlan = 'FREE';
    let hasPaidAccess = false;
    let accessPermissions = 'charging_map';

    if (isMainAdmin) {
      role = 'ADMIN';
      isApproved = true;
      securityLevel = 'SUPERVISOR';
      subscriptionPlan = 'ENTERPRISE';
      hasPaidAccess = true;
      accessPermissions = 'charging_map,battery_toolkit,analytics,user_management,fleet_management';
    } else if (parsedBody.data.accountType === 'EMPLOYEE') {
      role = 'EMPLOYEE';
      isApproved = false;
      securityLevel = 'BASIC';
    } else if (parsedBody.data.accountType === 'FLEET') {
      role = 'FLEET_MANAGER';
      subscriptionPlan = 'ENTERPRISE';
      hasPaidAccess = true;
      accessPermissions = 'charging_map,fleet_management';
    }

    const user = await db.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizedName,
          phone: sanitizedPhone,
          password: hashedPassword,
          role,
          verificationCode,
          verificationCodeExpiry,
          isEmailVerified: false,
          isApproved,
          securityLevel,
          requestedRole: parsedBody.data.accountType === 'EMPLOYEE' ? 'EMPLOYEE' : null,
          subscriptionPlan,
          hasPaidAccess,
          accessPermissions,
        },
      });

      if (role === 'FLEET_MANAGER') {
        await transaction.fleet.create({
          data: {
            name: `${sanitizedName}'s Fleet`,
            description: `Fleet managed by ${sanitizedName}`,
            category: 'PERSONAL',
            ownerId: createdUser.id,
            contactEmail: sanitizedEmail,
            contactPhone: sanitizedPhone,
          },
        });
      }

      return createdUser;
    });

    if (parsedBody.data.accountType === 'EMPLOYEE') {
      await Promise.all([
        enqueueEmailJob({
          type: 'employee_pending',
          to: user.email,
          data: { name: user.name || 'User' },
        }),
        enqueueEmailJob({
          type: 'new_employee_notification',
          to: MAIN_ADMIN_EMAIL,
          data: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        }),
      ]);
    } else {
      await enqueueEmailJob({
        type: 'verification',
        to: user.email,
        data: {
          code: verificationCode,
          name: user.name || 'User',
        },
      });
    }

    logger.info('User registered', { userId: user.id, email: user.email, role: user.role });

    return jsonSuccess(request, {
      success: true,
      message:
        parsedBody.data.accountType === 'EMPLOYEE'
          ? 'Account created. Your employee registration is pending approval.'
          : 'Account created. Please check your email for the verification code.',
      userId: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    });
  } catch (error) {
    return handleRouteError(request, error, { route: '/api/auth/register' });
  }
}
