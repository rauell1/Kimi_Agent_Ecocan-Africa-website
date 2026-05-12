# DJ Kimchi Website

Official website for DJ Kimchi, focused on bookings, media showcases, and social presence.

Built with Next.js App Router, TypeScript, Tailwind CSS, Prisma (SQLite), and Resend email delivery.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

## Preview

<p>
	<img src="public/images/hero-bg.png" alt="Home hero section" width="420" />
	<img src="public/images/mix-cover-1.png" alt="Mix artwork" width="420" />
</p>

<p>
	<img src="public/images/about-bg.png" alt="About section background" width="420" />
	<img src="public/images/dj-live-performance.jpeg" alt="Live performance photo" width="420" />
</p>

## Project Snapshot
<!-- AUTO_STATUS_START -->
- Current Version: `0.2.0`
- Last Major Upgrade: `v0.x` on `2026-04-10` (version `0.2.0`)
- Last Synced: `2026-04-12`
<!-- AUTO_STATUS_END -->

## Major Upgrade Log
<!-- MAJOR_LOG_START -->
- 2026-04-10: README auto-update baseline initialized at `0.2.0`.
<!-- MAJOR_LOG_END -->

## What This Site Includes

- Single-page marketing and booking experience
- Hero, About, Music, Videos, Photos, and Bookings sections
- Mixcloud and HearThis track discovery links
- Global music player state management
- Booking API with validation, rate limiting, and optional email notification
- SQLite persistence through Prisma
- Health endpoint for runtime checks

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Prisma + SQLite
- Resend (email notifications)
- Framer Motion (section transitions)

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

Create a `.env` file in the project root:

```env
# Optional in development, recommended in production
DATABASE_URL="file:./db/custom.db"

# Optional: required only if you want email notifications on bookings
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxx"
```

### 3) Initialize database

```bash
npm run db:generate
npm run db:push
```

### 4) Run development server

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` - start local dev server with Turbopack
- `npm run build` - create standalone production build
- `npm run start` - run standalone server via Bun
- `npm run lint` - run ESLint
- `npm run db:generate` - generate Prisma client
- `npm run db:push` - sync Prisma schema to SQLite
- `npm run db:migrate` - create and run migrations (dev)
- `npm run db:reset` - reset development database
- `npm run health:check` - run project health checks
- `npm run map:update` - regenerate codebase map
- `npm run map:watch` - watch and regenerate map continuously
- `npm run arch:update` - regenerate architecture map
- `npm run readme:update` - update README snapshot and major version log blocks

## API Endpoints

- `POST /api/booking`
	- Validates input with Zod
	- Rate limits by IP
	- Stores booking in SQLite if DB is available
	- Sends booking notification email if Resend is configured
- `GET /api/health`
	- Checks server status
	- Reports DB connection state
	- Reports email configuration state

## Project Structure

Key areas:

- `src/app` - app routes and API handlers
- `src/components/site` - section-level UI components
- `src/lib/site-data.ts` - centralized content and metadata
- `src/stores/audio-store.ts` - global player state
- `prisma/schema.prisma` - data model
- `db/custom.db` - local SQLite database file
- `docs/codebase-map.md` - generated codebase map
- `CODEBASE_DEBUG_MAP.md` - top-level project map

## Deployment Notes

- Production build uses standalone output from Next.js.
- Root scripts like `start.sh` and `run-server.sh` include restart loops for unattended environments.
- `Caddyfile.txt` is included for reverse-proxy setups.

## Troubleshooting

- Booking succeeds but no email is sent:
	- Set a valid `RESEND_API_KEY` in `.env`.
- Booking API returns storage warning:
	- Confirm `DATABASE_URL` is set or that local SQLite is writable.
- Mix embed says content not found:
	- Verify source URL in `src/lib/site-data.ts`.
	- Replace stale or removed Mixcloud track links.
- Preview appears blank after deploy:
	- Run `npm run build` again and ensure the standalone server process is running.

## Workspace Structure Map

Use the top-level map file to inspect structure and branches:

- [CODEBASE_DEBUG_MAP.md](CODEBASE_DEBUG_MAP.md)
- Refresh once: `npm run map:update`
- Live auto-refresh: `npm run map:watch`

## Auto README Updates

This repository includes automation that updates this README when `package.json` has a major version bump.

- Script: `npm run readme:update`
- Workflow: `.github/workflows/update-readme-major-upgrade.yml`
- Trigger: push to `main` or `master` with `package.json` changes

<!-- deploy: trigger -->
