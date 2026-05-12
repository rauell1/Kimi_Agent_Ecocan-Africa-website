# SafariCharge Production Audit

This audit records the major structural, security, and scalability findings from the current hardening pass, along with the concrete changes already applied.

## 1. Key Issues Found

- Authentication previously trusted the client.
  - The old flow relied on persisted Zustand state and client-controlled identity parameters.
- Admin and fleet APIs accepted dangerous caller-controlled fields.
  - Routes trusted `userId`, `requesterRole`, and similar request parameters.
- Session handling was not production-safe.
  - Auth state lived in browser storage instead of secure server-backed sessions.
- Validation and rate limiting were inconsistent.
  - Several routes accepted unvalidated bodies and had no request throttling.
- Scalability was limited by single-process state.
  - Rate limiting and email processing were stored in memory.
- The repo contained a large amount of scaffold dead code.
  - Many unused shadcn components and an orphaned fleet dashboard were never referenced.
- The README and environment documentation were stale.
  - The previous README had encoding corruption and did not match the current runtime model.

## 2. Dead Code Removal

### Deleted in this pass

- `src/app/api/users/route.ts`
  - Duplicate and unsafe API surface.
- `src/components/safari/fleet-dashboard.tsx`
  - Orphaned component.
- `src/hooks/use-mobile.ts`
  - Unused hook.
- Unused UI scaffolding removed from `src/components/ui/`:
  - `alert-dialog.tsx`
  - `alert.tsx`
  - `aspect-ratio.tsx`
  - `breadcrumb.tsx`
  - `calendar.tsx`
  - `carousel.tsx`
  - `chart.tsx`
  - `checkbox.tsx`
  - `collapsible.tsx`
  - `command.tsx`
  - `context-menu.tsx`
  - `drawer.tsx`
  - `form.tsx`
  - `hover-card.tsx`
  - `input-otp.tsx`
  - `menubar.tsx`
  - `navigation-menu.tsx`
  - `pagination.tsx`
  - `popover.tsx`
  - `radio-group.tsx`
  - `resizable.tsx`
  - `sidebar.tsx`
  - `slider.tsx`
  - `sonner.tsx`
  - `switch.tsx`
  - `toggle-group.tsx`

### Feature stub removed

- `src/components/safari/station-card.tsx`
  - Removed the fake local-only photo upload preview because it was not backed by object storage or a persistent API.

### Remaining cleanup candidates

- Unused package candidates with no current source imports:
  - `next-auth`
  - `next-intl`
  - `@mdxeditor/editor`
  - `z-ai-web-dev-sdk`
- Empty route folder cleanup:
  - `src/app/api/users/`

## 3. Folder Restructure Proposal

The current repo is still mostly organized by technical layer. The proposed production structure should be feature-first.

### Current structure

```text
src/
  app/
  components/
    safari/
    ui/
  contexts/
  data/
  hooks/
  lib/
  stores/
  types/
```

### Proposed structure

```text
src/
  app/
    (marketing)/
    (dashboard)/
    api/
  features/
    auth/
      components/
      hooks/
      services/
      types/
      utils/
    admin/
      components/
      hooks/
      services/
      types/
      utils/
    charging/
      components/
      hooks/
      services/
      types/
      utils/
    fleet/
      components/
      hooks/
      services/
      types/
      utils/
    stations/
      components/
      hooks/
      services/
      types/
      utils/
  shared/
    components/ui/
    config/
    lib/
    styles/
```

### Recommended migration order

1. Move auth store and auth UI into `features/auth`.
2. Move fleet UI and fleet API helpers into `features/fleet`.
3. Move admin user and employee approval flows into `features/admin`.
4. Leave `shared/components/ui` only for generic primitives.

## 4. Hardcoded Value Extraction

### Extracted in this pass

- Environment validation centralized in `src/lib/env.ts`.
- App-wide constants centralized in `src/lib/config.ts`.
- Session duration and refresh windows moved into config.
- Rate-limit thresholds moved into config.
- Validation limits moved into config.
- Main admin email moved behind environment validation.
- Health endpoint now reads version and service metadata from config.
- Layout metadata now uses `APP_CONFIG`.
- `.env.example` now documents the live runtime variables.

### Still remaining

- Many Safari UI components still use inline color hex values.
- Some dashboard/demo stats are still hardcoded in feature components.
- Frontend copy such as phone numbers and contact details should move to shared marketing config.

## 5. Naming Standardization

### Improved in this pass

- `data` response variables in touched client components were renamed to `responseData`.
- Email delivery result naming was clarified in `src/app/api/email/route.ts`.
- New auth/session helpers use explicit names such as `requireAuthenticatedSession`, `createSessionForUser`, and `invalidateSessionByToken`.

### Remaining naming debt

- Several presentation-heavy components still use broad names such as `stats`.
- The repo still uses a generic `lib/` bucket for both infrastructure and domain logic.
- Future feature moves should prefer names like `adminUserResponse`, `fleetListResponse`, or `stationSummaryCards` over generic `data` and `stats`.

## 6. Top 5 Scalability Risks At 10,000+ Users

### Risk 1: SQLite on a serverless production workload

- Failure mode:
  - File-based locking, poor concurrent write behavior, and difficult horizontal scale.
- Fix:
  - Move Prisma to managed Postgres plus connection pooling.
- Code impact:
  - Update Prisma datasource provider, migrate data, and point `DATABASE_URL` at managed Postgres.

### Risk 2: In-memory rate limiting and in-memory queue coordination

- Failure mode:
  - Limits reset per instance and background jobs can double-run across instances.
- Fix:
  - Move rate limits and queue claiming to Redis-backed primitives or a managed queue.
- Code impact:
  - Replace the in-process limiter store in `src/lib/security.ts`.
  - Move `Job` scheduling to Redis, SQS, Upstash Queue, or a dedicated worker platform.

### Risk 3: Station distance filtering happens in application memory

- Failure mode:
  - `GET /api/stations` loads matching stations into memory before distance filtering and pagination.
- Fix:
  - Use geospatial queries in Postgres or precomputed indexed geohash columns.
- Code impact:
  - Replace in-memory radius filtering with DB-level search and server-side pagination.

### Risk 4: Single-page client shell grows without route splitting

- Failure mode:
  - Every authenticated user loads a large client bundle even when using one feature area.
- Fix:
  - Split dashboard, map, fleet, admin, and analytics into route segments.
- Code impact:
  - Break `src/app/page.tsx` into route groups and load feature areas lazily.

### Risk 5: Cron-driven background work becomes a bottleneck

- Failure mode:
  - Email backlog and maintenance work can grow faster than a single scheduled job drains it.
- Fix:
  - Move to dedicated workers with retry backoff, metrics, and dead-letter handling.
- Code impact:
  - Keep the `Job` model as the contract, but process jobs continuously outside request lifecycle.

## 7. Worst File Rewrite

- Rewritten file:
  - `src/app/page.tsx`
- Why it was the worst:
  - It previously mixed auth hydration, tab permissions, state bootstrapping, and layout concerns.
- Improvements:
  - Auth boot now comes from the server session.
  - Invalid tabs are normalized through one guard effect.
  - Footer and loading behavior are isolated.
  - The obsolete selected station state was removed.

## 8. Security Hardening

### Implemented

- Database-backed httpOnly cookie sessions
- Session invalidation on logout
- Approval and block enforcement inside session lookup
- Shared Zod validation for auth, fleet, stations, admin mutations, and sessions
- Route-level RBAC helpers
- Rate limiting for login, register, verify, email, and mutation routes
- Proper CORS handling for API routes
- Structured JSON logging
- Environment validation at startup
- Authenticated cron endpoint
- Admin-only delete, block, unblock, and role mutation safeguards
- Prevention of self-delete, self-block, and self-demotion edge cases

### Not yet fully implemented in code

- Shared Redis rate limiting
- Webhook signature verification
  - No inbound webhook route currently exists, so this remains a launch requirement for any future webhook integration.

## 9. Performance And Database Improvements

### Applied

- Added indexes across high-read and high-filter tables:
  - `User`
  - `ChargingStation`
  - `Connector`
  - `ChargingSession`
  - `Notification`
  - `AnalyticsData`
  - `Fleet`
  - `FleetVehicle`
  - `FleetChargingSession`
- Added pagination helpers and applied them to admin, fleet, session, and station APIs.
- Added transactional updates where connector or fleet aggregate state must stay consistent.
- Added a real `Session` table and `Job` table.

### Still recommended

- Add aggregate read models or materialized views for analytics-heavy dashboards.
- Add caching for high-read station lookups once routes are split.

## 10. Infrastructure And File Handling

### Applied

- Removed the misleading browser-local photo upload stub from station cards.

### Required for production

- Use signed uploads to S3 or another object store.
- Serve uploaded assets behind a CDN.
- Store only object keys and metadata in Prisma, never raw files.

## 11. Reliability And Observability

### Applied

- Structured logger in `src/lib/logger.ts`
- Health endpoint in `src/app/api/route.ts`
- Global error boundary in `src/app/error.tsx`
- Custom not-found page in `src/app/not-found.tsx`
- Environment validation in `src/lib/env.ts`

### Recommended next

- Ship logs to a provider such as Datadog, Better Stack, or Sentry.
- Add request IDs to logs and responses.
- Add metrics for queue depth, auth failures, and API latency.

## 12. Background Processing

- Implemented:
  - Email sending now supports a queued job path through `src/lib/jobs.ts`.
  - Cron maintenance processes pending jobs and expires old sessions.
- Recommended next:
  - Replace cron-only draining with dedicated workers and dead-letter handling.

## 13. Session And Auth Management

- Implemented:
  - Server-side sessions in the database
  - Sliding session refresh
  - Logout invalidation
  - Email verification expiry
  - Employee approval checks
  - Blocked user enforcement
- Still needed:
  - Password reset routes using the existing reset token fields
  - Device/session management UI for users

## 14. Data Safety

### Strategy documented

- Backups:
  - Use managed database daily snapshots plus point-in-time recovery.
- Migration safety:
  - Use forward-only Prisma migrations in production.
  - Run migrations in staging first.
  - Never use `db push` against production.
- Rollback:
  - Prefer reversible code deploys and compensating data migrations over ad hoc schema rollback.

## 15. Production-Ready Recommendations

### Immediate

1. Move from SQLite to managed Postgres.
2. Replace in-memory rate limits and queue coordination with shared infrastructure.
3. Run `prisma generate` and a full typecheck/build in an environment with Node or Bun installed.
4. Prune unused package dependencies and refresh lockfiles.
5. Split the giant client shell into feature routes.

### Short term

1. Add password reset endpoints and expiring reset links.
2. Move static marketing/contact values into shared config.
3. Replace remaining inline hex values with semantic theme tokens.
4. Add storage-backed image upload flows only after S3/CDN infrastructure is ready.

### Long term

1. Add observability dashboards and alerting.
2. Introduce worker-based job execution.
3. Add geospatial search support at the database layer.
4. Add audit logging for role and permission changes.
