import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyCorsHeaders } from '@/lib/api';
import { logger } from '@/lib/logger';

/**
 * Security middleware for SafariCharge
 *
 * Responsibilities:
 * 1. Security headers for all responses
 * 2. API route protection
 * 3. Request logging for audit
 */

// Routes that require admin role
const ADMIN_ONLY_ROUTES = [
  '/api/admin/employees',
  '/api/admin/users',
];

// Security headers to apply to all responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') && request.method === 'OPTIONS') {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), request);
  }

  const response = pathname.startsWith('/api')
    ? applyCorsHeaders(NextResponse.next(), request)
    : NextResponse.next();

  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add Content Security Policy for non-API routes
  if (!pathname.startsWith('/api')) {
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
      ].join('; ')
    );
  }

  // Log API requests for audit (in production, send to logging service)
  if (pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const method = request.method;
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (process.env.NODE_ENV === 'development' || pathname.startsWith('/api/admin')) {
      logger.info('API request received', {
        method,
        pathname,
        ip,
        userAgent: userAgent.slice(0, 80),
      });
    }
  }

  const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
  if (isAdminRoute) {
    response.headers.set('X-Requires-Admin', 'true');
  }

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
