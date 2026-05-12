# Full-Stack Security, Performance & Reliability Audit

Date: 2026-04-03  
Scope: `src/`, `prisma/`, runtime/config (`README.md`, `vercel.json`, Next.js API/middleware)

---

Issue: In-memory rate limiting resets per instance and does not cover most API routes

Risk Level: High

Description:
Rate limiting is implemented with a process-local `Map`, so limits reset on deploy/restart and do not synchronize across instances. Also, only auth/email routes currently call `checkRateLimit`; most mutation/admin routes have no explicit throttling.

Impact:
Attackers can bypass throttling by distributing requests across instances, and sensitive admin or write-heavy endpoints can be brute-forced or abused.

Fix:
1. Replace local `Map` limiter with shared Redis/Upstash store.
2. Apply rate limiting middleware to all API routes by policy (read vs mutation tiers).
3. Key limits by IP + user/session + route prefix.

Code example:
```ts
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const mutationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '15 m'),
  analytics: true,
});

export async function enforceMutationLimit(key: string) {
  const result = await mutationLimiter.limit(key);
  return result; // { success, reset, remaining }
}
```

Best Practice:
Use a shared, centrally managed rate-limit backend and enforce route-class policies by default, not route-by-route.

---

Issue: Station search performs unbounded DB reads and in-memory geo filtering

Risk Level: High

Description:
`GET /api/stations` fetches all matching stations first, then calculates distance/filtering/pagination in memory.

Impact:
Large datasets can cause high memory/CPU usage, slow responses, and timeout risk under load.

Fix:
1. Push geospatial/radius filtering into the database.
2. Paginate at DB query layer (`skip/take` or cursor).
3. Add geospatial indexes (Postgres + PostGIS preferred).

Code example:
```ts
// Postgres + PostGIS conceptual query
SELECT id, name, latitude, longitude,
       ST_DistanceSphere(
         ST_MakePoint(longitude, latitude),
         ST_MakePoint($1, $2)
       ) AS distance_m
FROM "ChargingStation"
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography,
  $3
)
ORDER BY distance_m
LIMIT $4 OFFSET $5;
```

Best Practice:
Never load full result sets for location search in application memory; use indexed DB-side geospatial operators.

---

Issue: Session expiration is refreshed, but token rotation is not performed

Risk Level: Medium

Description:
Session expiry is extended near threshold, but the cookie token itself is not rotated during refresh.

Impact:
If a token is stolen, the attacker may retain valid access longer because token identity remains static until logout/expiry.

Fix:
1. Rotate session token when refreshing near expiration.
2. Invalidate old token hash atomically.
3. Record token family/jti for theft detection and revocation.

Code example:
```ts
// inside refresh path
const newToken = generateSecureToken(64);
await db.session.update({
  where: { id: session.id },
  data: {
    tokenHash: hashSessionToken(newToken),
    expiresAt: nextExpiration,
    lastAccessedAt: new Date(),
  },
});
attachSessionCookie(response, newToken, nextExpiration);
```

Best Practice:
Use rolling sessions with token rotation and revoke-on-reuse semantics for stronger session hijack resistance.

---

Issue: Default environment secrets are permissive in non-production and some critical vars are optional

Risk Level: Medium

Description:
`SESSION_SECRET` has a development default; several critical integration variables (email/storage) are optional, enabling partial startup without strict production safety gates.

Impact:
Misconfigured deployments may run with weak defaults or silently degraded security/reliability behavior.

Fix:
1. Enforce environment-specific required variables.
2. Fail startup in production when critical secrets/providers are missing.
3. Add an explicit startup diagnostics report.

Code example:
```ts
if (env.NODE_ENV === 'production') {
  z.object({
    SESSION_SECRET: z.string().min(32),
    CRON_SECRET: z.string().min(24),
    RESEND_API_KEY: z.string().min(1),
  }).parse(process.env);
}
```

Best Practice:
Treat production config as a contract: strict required vars, no insecure defaults, and fail-fast startup.

---

Issue: Password reset security flow is not implemented despite schema fields

Risk Level: Medium

Description:
Database fields for reset token/expiry exist, but no password reset API flow is present for issuance, single-use validation, and consumption.

Impact:
Users lack a secure recovery path, increasing account lockout and operational support burden; rushed ad-hoc recovery can create vulnerabilities.

Fix:
1. Add `POST /api/auth/password-reset/request` and `POST /api/auth/password-reset/confirm`.
2. Store only hashed reset tokens with short TTL.
3. Enforce single-use consumption in transaction and notify user after reset.

Code example:
```ts
const rawToken = generateSecureToken(64);
const tokenHash = sha256(rawToken + getSessionSecret());
await db.user.update({
  where: { email },
  data: { resetToken: tokenHash, resetTokenExpiry: getPasswordResetExpiry() },
});
```

Best Practice:
Password reset tokens should be high-entropy, hashed at rest, short-lived, single-use, and audited.

---

Issue: No webhook signature verification or payment idempotency implementation

Risk Level: Medium

Description:
No payment/webhook endpoints were found. If payment integration is added without signature verification and idempotency controls, it will be vulnerable by default.

Impact:
Forged callbacks or duplicate event processing can cause fraudulent state transitions, double fulfillment, or accounting mismatch.

Fix:
1. Verify provider signatures on raw request body.
2. Store processed event IDs and enforce idempotent handlers.
3. Separate “received”, “validated”, and “applied” event states.

Best Practice:
All webhooks must use cryptographic signature verification and durable idempotency keys before mutating business state.

---

Issue: CORS behavior allows credentials broadly and relies on origin list hygiene

Risk Level: Medium

Description:
CORS always sets `Access-Control-Allow-Credentials: true`; `Allow-Origin` is conditional, but policy still depends heavily on maintaining strict origin configuration.

Impact:
Misconfigured allowed origins can expose authenticated APIs cross-origin.

Fix:
1. Disable credentialed CORS where not required.
2. Restrict to explicit production origins only.
3. Add tests that fail if wildcard/dev origins appear in production config.

Code example:
```ts
if (isTrustedOrigin(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
} else {
  response.headers.delete('Access-Control-Allow-Credentials');
}
```

Best Practice:
Use least-privilege CORS with explicit per-environment origin allowlists and automated policy tests.

---

Issue: Database portability/performance risk from default SQLite in production-oriented code paths

Risk Level: Medium

Description:
Datasource is SQLite, while the app includes multi-user sessions, job queueing, and analytics patterns that typically need production-grade concurrency and pooling behavior.

Impact:
Higher chance of lock contention and scale ceilings in real traffic.

Fix:
1. Move to managed Postgres.
2. Enable connection pooling and tune pool limits/timeouts.
3. Add DB performance dashboards (slow query latency, lock wait, pool usage).

Best Practice:
Use SQLite only for local/dev or low-concurrency deployments; production should run managed Postgres with pooling.

---

Issue: Backup and restore procedures are not codified in repository

Risk Level: Medium

Description:
No explicit automated backup schedule, retention policy, or restore-runbook/testing process is defined in code/docs.

Impact:
Data loss recovery may be slow or incomplete during incidents.

Fix:
1. Define backup frequency (e.g., PITR + daily snapshots).
2. Document restore RTO/RPO targets.
3. Add quarterly restore drills and evidence artifacts.

Best Practice:
Backups are only reliable if restore is routinely tested and operational ownership is clear.

---

Issue: Migration discipline risk (schema present, migrations directory absent)

Risk Level: Low

Description:
Schema exists but no committed migration history was found in `prisma/migrations`.

Impact:
Schema drift risk across environments and harder rollback/change auditing.

Fix:
1. Adopt migration-first workflow (`prisma migrate`).
2. Commit all migrations and run them in staging before production.
3. Add CI check to fail when schema changes without migration files.

Best Practice:
Use forward-only, reviewed migrations with environment promotion gates.

---

Issue: Frontend crash containment is partial (global boundary exists, feature-level boundaries limited)

Risk Level: Low

Description:
A global app error boundary exists, but complex feature modules do not show evidence of granular boundary isolation.

Impact:
Single widget/runtime error can take down large sections of authenticated UI.

Fix:
1. Add route/feature-level error boundaries around high-complexity dashboards.
2. Add fallback skeletons for critical widgets.
3. Capture boundary events to monitoring.

Best Practice:
Use layered error boundaries (global + route + widget) so local failures degrade gracefully.

---

Issue: Type safety gaps in critical runtime payload handling

Risk Level: Low

Description:
Some paths use direct casting from `request.json()` to payload types instead of strict schema parsing.

Impact:
Unexpected runtime shapes can bypass assumptions and cause downstream failures.

Fix:
1. Validate every inbound body with Zod schema.
2. Avoid unchecked casts on request payloads.
3. Keep response contracts typed and validated.

Code example:
```ts
const parsed = emailJobSchema.safeParse(await request.json());
if (!parsed.success) return jsonError(request, 'Invalid payload', 400);
const payload = parsed.data;
```

Best Practice:
Use schema-validated boundaries at every IO edge (request, queue payload, external API).

---

## Prioritized Action Plan

### Immediate (security-critical)
1. Replace in-memory rate limiting with shared distributed limiter and enforce on all mutation/admin endpoints.
2. Add session token rotation on refresh.
3. Implement secure password-reset request/confirm flow (hashed, expiring, single-use tokens).
4. Tighten production CORS origin management and credential policy tests.

### Short-term (performance & stability)
1. Rework station search to DB-level geospatial filtering + server-side pagination.
2. Move from SQLite to managed Postgres with pooling.
3. Add feature-level React error boundaries on major dashboard sections.
4. Replace unchecked payload casts with schema validation everywhere.

### Long-term (architecture improvements)
1. Introduce webhook framework with signature verification + idempotent event processing before enabling payments.
2. Establish backup/restore policy, runbooks, and recurring restore drills.
3. Enforce migration-first CI policy and staged rollout governance.
4. Expand observability with SLOs (auth failure rate, queue latency/depth, DB p95, API p95).
