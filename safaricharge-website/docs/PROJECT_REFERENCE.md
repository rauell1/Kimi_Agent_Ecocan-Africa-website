# SafariCharge Project Reference

This document is the fast-start reference for future work on this repository. Read this first when you need context without rescanning the entire codebase.

## Product Summary

SafariCharge is a Next.js 16 application for EV charging operations. It combines:

- Public and authenticated charging workflows
- Fleet management for fleet managers and staff
- Admin-only user and employee approval tooling
- Email-based account verification
- Background job processing for emails and maintenance

## Current Stack

- Frontend: Next.js App Router, React 19, Tailwind CSS, shadcn/ui, Zustand
- Backend: Next.js route handlers
- Database: Prisma with a checked-in SQLite datasource for local development
- Email: Resend
- Auth: Custom cookie session layer backed by the `Session` table
- Hosting target: Vercel

## High-Value Files

- `src/app/page.tsx`
  - Main client shell for authenticated vs unauthenticated experience.
  - Rewritten to initialize auth from the server session instead of client storage.
- `src/stores/auth-store.ts`
  - Client auth store.
  - Source of truth is now `/api/auth/me`, not `localStorage`.
- `src/lib/session.ts`
  - Session creation, lookup, expiry refresh, cookie attachment, and logout invalidation.
- `src/lib/access-control.ts`
  - `requireUser`, `requireRole`, `requireAdminUser`, `requireFleetAccess`.
  - Use these in every protected route.
- `src/lib/api.ts`
  - Shared JSON success/error helpers, pagination, CORS application, and route error handling.
- `src/lib/versioning.ts`
  - Central versioning layer with Prisma middleware, `withVersioning` helper, and snapshot hashing.
- `src/lib/validation.ts`
  - Shared Zod schemas for auth, fleet, stations, and session mutation payloads.
- `src/lib/security.ts`
  - Rate limiting, sanitization, password rules, secure token helpers.
- `src/lib/env.ts`
  - Environment validation at startup.
- `src/lib/jobs.ts`
  - Background queue primitives currently used for email delivery.
- `src/lib/email.ts`
  - Transactional email rendering and provider integration.
- `src/app/api/**`
  - App Router API surface. All high-risk routes now rely on server-side session and RBAC checks.
- `src/app/api/admin/versioning/route.ts`
  - Admin-only GET for the version store and POST rollback that clones a prior version instead of deleting history.

## Core Trust Boundaries

These are the rules that matter most when changing this codebase:

- Never trust `userId`, `role`, `requesterRole`, or similar client-supplied fields.
- Only trust the authenticated session returned by `requireUser()` or `requireRole()`.
- Session state lives in the database and an httpOnly cookie, not in browser storage.
- All external input should go through shared Zod validation before touching Prisma.
- Mutation endpoints should use `jsonError` / `jsonSuccess` and `handleRouteError`.

## Auth Flow

1. Register or login via `/api/auth/register` or `/api/auth/login`.
2. If email verification is required, a code is stored on the user record and queued for email delivery.
3. `/api/auth/verify` creates a server session and sets the cookie.
4. The client store calls `/api/auth/me` on startup to hydrate authenticated state.
5. `/api/auth/logout` deletes the DB session and clears the cookie.

## Important Models

- `User`
  - Roles, approval state, blocking state, verification fields.
- `Session`
  - Secure server-backed auth session.
- `Job`
  - Background work queue entry. Currently used for email delivery.
- `ChargingStation`, `Connector`, `ChargingSession`
  - Main charging domain.
- `Fleet`, `FleetVehicle`, `FleetChargingSession`
  - Fleet domain.

## Operational Notes

- After every Prisma schema change, run `prisma generate`.
- Version history is persisted in the new `VersionEntry` and `VersionPointer` tables; `attachVersioningMiddleware(db)` auto-logs Prisma mutations.
- The cron route requires `Authorization: Bearer <CRON_SECRET>`.
- The health endpoint is `GET /api`.
- Vercel must point its Root Directory at `safaricharge-website`.
- `vercel.json` forces the project to build as a standard Next.js app.

## Current Production Gaps

These are known and important:

- The checked-in Prisma datasource is still SQLite. Move to managed Postgres before real production scale.
- Rate limiting and job queue state are in-process. Move both to shared infrastructure such as Redis/Upstash before multi-instance production.
- Geospatial station filtering still loads stations into memory, then computes distance in application code.
- Many frontend components still carry hardcoded color values and dashboard demo content.
- A few obviously unused dependencies remain in `package.json` and should be pruned in an install-enabled environment.

## Recommended Starting Points For Future Prompts

- Security or auth request:
  - Read `src/lib/session.ts`, `src/lib/access-control.ts`, `src/lib/security.ts`, and relevant `src/app/api/auth/**`.
- Fleet request:
  - Read `src/app/api/fleet/**` and `src/components/safari/fleet-management.tsx`.
- Admin tooling request:
  - Read `src/app/api/admin/**`, `src/components/safari/admin-user-management.tsx`, and `src/components/safari/employee-approval-dashboard.tsx`.
- Deployment request:
  - Read `vercel.json`, `src/app/api/route.ts`, `src/proxy.ts`, `.env.example`, and `README.md`.

## Related Docs

- `docs/PRODUCTION_AUDIT.md`
- `README.md`
