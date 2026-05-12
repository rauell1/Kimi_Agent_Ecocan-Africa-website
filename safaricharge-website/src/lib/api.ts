import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG, PAGINATION_CONFIG } from '@/lib/config';
import { logger } from '@/lib/logger';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'API_ERROR',
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return true;
  }

  return APP_CONFIG.allowedOrigins.includes(origin);
}

export function applyCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');

  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');

  return response;
}

export function jsonSuccess<T>(request: NextRequest, data: T, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  return applyCorsHeaders(response, request);
}

export function jsonError(
  request: NextRequest,
  message: string,
  status = 500,
  details?: Record<string, unknown>
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );

  return applyCorsHeaders(response, request);
}

export function handleRouteError(request: NextRequest, error: unknown, context: Record<string, unknown> = {}) {
  if (error instanceof ApiError) {
    logger.warn('API request failed', { ...context, status: error.status, code: error.code, error });
    return jsonError(request, error.message, error.status, error.details);
  }

  logger.error('Unexpected API error', { ...context, error });
  return jsonError(request, 'Internal server error', 500);
}

export function parseInteger(value: string | null | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(parseInteger(searchParams.get('page'), PAGINATION_CONFIG.defaultPage), 1);
  const pageSize = Math.min(
    Math.max(parseInteger(searchParams.get('pageSize'), PAGINATION_CONFIG.defaultPageSize), 1),
    PAGINATION_CONFIG.maxPageSize
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function createPaginationMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
