# SafariCharge Production-Grade Audit & Refactor Plan

Date: 2026-04-03

## 1) Dead code removal candidates

The following were identified as safe/likely-safe cleanup candidates from import-graph inspection and repository usage checks:

- `upload/*.png` (15+ files): local clipboard image dumps not referenced by runtime code.
- `examples/websocket/frontend.tsx` and `examples/websocket/server.ts`: example-only files not imported by app runtime.
- `fleet_features.json` and `fleet_research.json`: analysis artifacts, not imported.
- `download/README.md`: generated artifact folder not used by runtime.

Functions/components to remove were not auto-deleted in this pass because each candidate should be validated against product roadmap before deletion.

## 2) Folder restructure (feature-first)

### Current (high level)

- `src/app` (routes + API)
- `src/components/safari` (mixed features)
- `src/lib` (cross-cutting logic + business logic)
- `src/stores`, `src/contexts`, `src/data`, `src/types`

### Recommended

```text
src/
  app/
    (public)/
    (dashboard)/
    api/
  features/
    auth/
      components/
      hooks/
      services/
      utils/
      types/
    stations/
      components/
      hooks/
      services/
      utils/
      types/
    fleet/
      components/
      hooks/
      services/
      utils/
      types/
    admin/
      components/
      hooks/
      services/
      utils/
      types/
  shared/
    ui/
    lib/
    types/
    config/
```

## 3) Hardcoded extraction summary

Implemented now:

- Added `STATION_QUERY_CONFIG` for radius/search and geospatial candidate limits.
- Replaced station query hardcoded values with config-backed limits in validation/runtime.

Remaining recommended extractions:

- Move remaining UI colors and animation constants from component files into shared design tokens.
- Move third-party webhook and upload timeouts into `config.ts` + env-backed overrides.

## 4) Naming standardization findings

Flagged names to improve in future sweep:

- Generic state names like `data`, `status`, `value` used in several UI components where domain names are clearer.
- Route-local variables such as `parsedBody` are acceptable, but feature services should use nouns like `stationCreateRequest`, `fleetVehicleUpdateInput`.

## 5) Top scalability risks for 10,000+ users

1. **In-memory rate limiting**
   - Failure mode: resets per instance; bypassable via horizontal scaling.
   - Fix: Redis/Upstash-backed distributed limiter.

2. **In-process job queue**
   - Failure mode: workers not coordinated across instances; duplicate processing risk.
   - Fix: external queue (BullMQ/SQS) with idempotent job keys.

3. **SQLite in production path**
   - Failure mode: write contention and limited concurrency.
   - Fix: Postgres + Prisma pooling (PgBouncer or serverless pool).

4. **Station discovery does app-memory geo filtering**
   - Failure mode: high memory/CPU and latency spikes on large datasets.
   - Fix: DB geospatial filtering + indexed lat/lng + cursor pagination.

5. **Single process session/rate/job dependencies**
   - Failure mode: inconsistent state under autoscaling/restarts.
   - Fix: centralize stateful concerns in managed data stores.

## 6) Worst file rewrite completed

- Rewrote `src/app/api/stations/route.ts`:
  - query validation with Zod,
  - bounded geospatial candidate search,
  - DB-level pagination when non-geo queries,
  - POST rate limiting,
  - improved helper decomposition and naming.

## 7) Documentation

- README updated and retained as canonical setup/deploy reference.
- This document adds explicit production hardening checklist and architecture target.

## 8) Security hardening status

Implemented in this iteration:

- Added rate limit enforcement to station creation endpoint.
- Added strict query validation for station search inputs.

Pending next steps:

- Distributed rate limiting backend.
- Webhook signature verification for future payment/webhook endpoints.
- Stronger CORS policy partitioning by route class.

## 9) Performance & database improvements

Implemented in this iteration:

- Reduced station search candidate set through bounding-box filtering before distance sort.
- Added bounded geospatial candidate window to prevent runaway memory usage.

Recommended next:

- PostGIS geospatial index + DB-native distance filters.
- Cursor pagination for high-churn datasets.

## 10) Infrastructure & file handling

Recommendation:

- Use S3-compatible object storage + CDN; keep only metadata in DB.
- Do not store uploads in repo or local server disk in production.

## 11) Reliability & observability

Current strengths:

- central route error handler and structured logger in place.

Recommended next:

- add request IDs and trace propagation,
- metrics exporter (latency/error/rate limits),
- readiness/liveness split health checks.

## 12) Background processing

Recommendation:

- move email/async tasks to distributed queue workers,
- enforce retry backoff + dead-letter queue.

## 13) Session/auth management

Recommendation:

- rotate session tokens on refresh,
- add password reset request/confirm flow with hashed single-use tokens,
- add anomaly detection for token reuse.

## 14) Data safety

Recommendation:

- scheduled backups with restoration drills,
- migration gates: preflight checks + canary rollout + rollback scripts.

## 15) Code quality

Recommendation:

- keep TypeScript strict mode,
- introduce feature service boundaries and dependency direction rules,
- add CI gates for lint, typecheck, tests, and migration checks.
