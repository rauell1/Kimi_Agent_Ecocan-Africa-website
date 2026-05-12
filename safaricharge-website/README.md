# SafariCharge

SafariCharge is a Next.js 16 EV charging platform for drivers, fleet managers, operations staff, and administrators. The application includes public charging discovery, secure authentication, fleet operations, admin approval flows, and background email processing.

This repository now includes a production audit and a durable project map so future work can start from architecture context instead of rescanning the full codebase.

## Quickstart

1. `npm install`
2. Copy `.env.example` to `.env` and fill in secrets.
3. `npm run db:push` to create the local SQLite database.
4. Optional: `bun run db:seed` to load demo data.
5. `npm run dev` to start the app.
6. `npm run lint` to verify the workspace.

## Core Features

- Charging station discovery and filtering
- Charging session creation and completion
- Fleet and vehicle management
- Admin user management and employee approval
- Email verification and transactional email delivery
- Server-backed session authentication with httpOnly cookies
- Structured health checks and background maintenance jobs

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS and shadcn/ui
- Prisma
- Zustand
- Resend

## Repository Docs

- `docs/PROJECT_REFERENCE.md`
  - Quick architecture reference for future prompts and onboarding.
- `docs/PRODUCTION_AUDIT.md`
  - Structural, security, and scalability audit plus recommended next steps.

## Getting Started

### Prerequisites

- Node.js 20+ for the web app
- Bun if you want to run the current seed script directly
- SQLite is used by default for local development; Vercel Postgres is supported in production

### Install

```bash
npm install
```

`npm install` runs `prisma generate` via the postinstall hook.

### Configure environment

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Fill in the values in `.env`.

### Prisma setup

```bash
npm run db:push
```

Optional seed:

```bash
bun run db:seed
```

Local data lives in `db/` (the default `DATABASE_URL` points at `file:./db/safaricharge.db`). Delete the SQLite file if you need a clean slate, then rerun `npm run db:push`.

### Start the app

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run start
```

### Project scripts

- `npm run lint` — ESLint across the repo
- `npm run build` — Next.js production build
- `npm run dev` — local development server
- `npm run db:push` — sync Prisma schema to the local database
- `npm run db:reset` — reset the local database (interactive)
- `npm run db:seed` — seed demo data with Bun

## Environment Variables

The canonical template lives in `.env.example`.

Key variables:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_VERSION`
- `MAIN_ADMIN_EMAIL`
- `SESSION_SECRET`
- `SESSION_COOKIE_NAME`
- `ALLOWED_ORIGINS`
- `RESEND_API_KEY`
- `CRON_SECRET`
- `ENABLE_DEMO_USERS`

Optional future storage variables:

- `S3_BUCKET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_PUBLIC_BASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

When deployed on Vercel with Vercel Postgres, the app will automatically use `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, or `POSTGRES_URL_NO_SSL` if `DATABASE_URL` is not provided.

## Current Structure

```text
db/
  safaricharge.db (created locally after db push)
docs/
  PROJECT_REFERENCE.md
  PRODUCTION_AUDIT.md
download/
  README.md (generated assets)
examples/
prisma/
  schema.prisma
  seed.ts
public/
src/
  app/
    api/
    error.tsx
    not-found.tsx
    layout.tsx
    page.tsx
  components/
    safari/
    ui/
  contexts/
  data/
  hooks/
  lib/
  stores/
  types/
  proxy.ts
upload/ (reference images)
```

## Important Runtime Notes

- Authentication is session-cookie based, not localStorage based.
- Protected API routes should use `requireUser()` or `requireRole()`.
- Input validation should use shared Zod schemas from `src/lib/validation.ts`.
- Background email work is queued through the `Job` model and drained by the cron route.
- `GET /api` is the health check endpoint.
- Automatic versioning and rollback:
  - Prisma mutations are wrapped by `src/lib/versioning.ts`, which records snapshots and updates the `VersionPointer` singleton.
  - GET `/api/admin/versioning` (admin) returns `{ current_version, versions }` assembled from `VersionEntry`.
  - POST `/api/admin/versioning` with `{ targetVersionId, metadata? }` clones the chosen version, tags `rolled_back_from`, and moves the pointer without deleting history.
  - Use `withVersioning(db, mutation, snapshotBuilder, metadata)` for non-Prisma mutations; run `npm run db:push` if the new `Version*` tables are missing locally.

## Deployment

### Vercel

Required settings:

1. Root Directory: `safaricharge-website`
2. Framework Preset: `Next.js`
3. No custom Output Directory override

This repo includes `vercel.json` to force a normal Next.js build path.

### Recommended production infrastructure

- Managed Postgres instead of SQLite
- Shared rate limiting store such as Redis or Upstash
- Object storage plus CDN for future file uploads
- Centralized logging and monitoring

## Security Notes

- Passwords use scrypt-based hashing
- Sessions are stored server-side in the database
- Cookies are httpOnly and secure in production
- Role-based access is enforced on the server
- Rate limiting is enabled for high-risk routes
- Environment configuration is validated at startup

## Next Recommended Steps

1. Move Prisma from SQLite to managed Postgres before launch.
2. Replace in-memory rate limiting and queue coordination with shared infrastructure.
3. Run a full build, lint, and Prisma generate in an environment with Node or Bun installed.
4. Split the single-page authenticated shell into feature routes.
5. Add password reset flows and storage-backed uploads when the required infrastructure is ready.
