# DJ Kimchi — Codebase Architecture Map

> **Auto-Generated.** Do not edit manually.
> Run `npm run arch:update` to refresh, or it updates automatically on every commit.

## Version

| Field | Value |
|-------|-------|
| Commit | `4e66749f` (`4e66749f4e23`) |
| Branch | `main` |
| Author | unknown |
| Generated | 2026-05-02T08:39:55.215Z |
| Total source files | 96 |
| Files changed in last commit | 1 |

### Changes Since Last Version

- chore: set default theme to light mode
- M: src/app/layout.tsx

## Architecture Summary

```
dj-kimchi/              Next.js 16 DJ portfolio + booking system
├── src/
│   ├── app/            Next.js App Router pages & layouts
│   │   ├── page.tsx    Single-page entrypoint (SPA shell)
│   │   ├── layout.tsx  Root layout (ThemeProvider + fonts)
│   │   └── api/        API Routes
│   │       ├── booking/    POST booking form → DB + Resend email
│   │       ├── health/     GET health probe (DB + email status)
│   │       ├── mixcloud-url/ GET stream URL via yt-dlp
│   │       └── webhooks/   POST inbound webhook handler
│   ├── components/
│   │   ├── site/       Domain-specific page sections
│   │   └── ui/         Shadcn/Radix primitives (40+ components)
│   ├── hooks/          Custom React hooks (4)
│   ├── stores/         Zustand audio state store
│   └── lib/            Shared utilities (db, env, rate-limit, resend)
├── prisma/             SQLite schema → Booking model
├── public/             Static assets (images)
├── scripts/            Tooling scripts (map gen, health, hooks)
└── docs/               Generated maps (this file)
```

## Codebase Tree

### Pages (1)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/app/page.tsx` | page | HomePage, default | no |

### Layouts (1)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/app/layout.tsx` | layout | metadata, RootLayout, default | no |

### API Routes (5)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/app/api/booking/route.ts` | api-route | POST | ⚠️ yes |
| `src/app/api/health/route.ts` | api-route | GET | ⚠️ yes |
| `src/app/api/mixcloud-url/route.ts` | api-route | GET | ⚠️ yes |
| `src/app/api/route.ts` | api-route | GET | ⚠️ yes |
| `src/app/api/webhooks/inbound/route.ts` | api-route | POST | ⚠️ yes |

### Site Components (12)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/components/site/about.tsx` | component-site | AboutSection | no |
| `src/components/site/bookings.tsx` | component-site | BookingsSection | no |
| `src/components/site/footer.tsx` | component-site | Footer | no |
| `src/components/site/global-player.tsx` | component-site | GlobalPlayer | no |
| `src/components/site/hero.tsx` | component-site | HeroSection | no |
| `src/components/site/index.ts` | component-site | — | no |
| `src/components/site/lazy-youtube.tsx` | component-site | LazyYoutube | no |
| `src/components/site/music.tsx` | component-site | MusicSection | no |
| `src/components/site/navigation.tsx` | component-site | Navigation | no |
| `src/components/site/page-padding.tsx` | component-site | PagePadding | no |
| `src/components/site/photos.tsx` | component-site | PhotosSection | no |
| `src/components/site/videos.tsx` | component-site | VideosSection | no |

### UI Primitives (49)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/components/ui/accordion.tsx` | component-ui | — | no |
| `src/components/ui/alert-dialog.tsx` | component-ui | — | no |
| `src/components/ui/alert.tsx` | component-ui | — | no |
| `src/components/ui/aspect-ratio.tsx` | component-ui | — | no |
| `src/components/ui/avatar.tsx` | component-ui | — | no |
| `src/components/ui/badge.tsx` | component-ui | — | no |
| `src/components/ui/breadcrumb.tsx` | component-ui | — | no |
| `src/components/ui/button.tsx` | component-ui | — | no |
| `src/components/ui/calendar.tsx` | component-ui | — | no |
| `src/components/ui/card.tsx` | component-ui | — | no |
| `src/components/ui/carousel.tsx` | component-ui | — | no |
| `src/components/ui/chart.tsx` | component-ui | ChartConfig | no |
| `src/components/ui/checkbox.tsx` | component-ui | — | no |
| `src/components/ui/collapsible.tsx` | component-ui | — | no |
| `src/components/ui/command.tsx` | component-ui | — | no |
| `src/components/ui/context-menu.tsx` | component-ui | — | no |
| `src/components/ui/dialog.tsx` | component-ui | — | no |
| `src/components/ui/drawer.tsx` | component-ui | — | no |
| `src/components/ui/dropdown-menu.tsx` | component-ui | — | no |
| `src/components/ui/form.tsx` | component-ui | — | no |
| `src/components/ui/hover-card.tsx` | component-ui | — | no |
| `src/components/ui/input-otp.tsx` | component-ui | — | no |
| `src/components/ui/input.tsx` | component-ui | — | no |
| `src/components/ui/label.tsx` | component-ui | — | no |
| `src/components/ui/menubar.tsx` | component-ui | — | no |
| `src/components/ui/navigation-menu.tsx` | component-ui | — | no |
| `src/components/ui/pagination.tsx` | component-ui | — | no |
| `src/components/ui/popover.tsx` | component-ui | — | no |
| `src/components/ui/progress.tsx` | component-ui | — | no |
| `src/components/ui/protected-image.tsx` | component-ui | ProtectedImage | no |
| `src/components/ui/radio-group.tsx` | component-ui | — | no |
| `src/components/ui/resizable.tsx` | component-ui | — | no |
| `src/components/ui/scroll-area.tsx` | component-ui | — | no |
| `src/components/ui/select.tsx` | component-ui | — | no |
| `src/components/ui/separator.tsx` | component-ui | — | no |
| `src/components/ui/sheet.tsx` | component-ui | — | no |
| `src/components/ui/sidebar.tsx` | component-ui | — | no |
| `src/components/ui/skeleton.tsx` | component-ui | — | no |
| `src/components/ui/slider.tsx` | component-ui | — | no |
| `src/components/ui/sonner.tsx` | component-ui | — | no |
| `src/components/ui/switch.tsx` | component-ui | — | no |
| `src/components/ui/table.tsx` | component-ui | — | no |
| `src/components/ui/tabs.tsx` | component-ui | — | no |
| `src/components/ui/textarea.tsx` | component-ui | — | no |
| `src/components/ui/toast.tsx` | component-ui | — | no |
| `src/components/ui/toaster.tsx` | component-ui | Toaster | no |
| `src/components/ui/toggle-group.tsx` | component-ui | — | no |
| `src/components/ui/toggle.tsx` | component-ui | — | no |
| `src/components/ui/tooltip.tsx` | component-ui | — | no |

### Other Components (2)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/components/error-boundary.tsx` | component | ErrorBoundary | no |
| `src/components/theme-provider.tsx` | component | ThemeProvider | no |

### Hooks (4)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/hooks/use-in-view.ts` | hook | useInView | no |
| `src/hooks/use-media-session.ts` | hook | useMediaSession, getEmbedSrc | no |
| `src/hooks/use-mobile.ts` | hook | useIsMobile | no |
| `src/hooks/use-toast.ts` | hook | reducer | no |

### Stores (1)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/stores/audio-store.ts` | store | TrackSource, AudioTrack, RepeatMode, AudioStore | ⚠️ yes |

### Library / Utilities (6)

| File | Role | Exports | Core? |
|------|------|---------|-------|
| `src/lib/db.ts` | lib | db, isDatabaseEnabled, isDatabaseConfigured | ⚠️ yes |
| `src/lib/env.ts` | lib | validateEnv | ⚠️ yes |
| `src/lib/rate-limit.ts` | lib | rateLimit | ⚠️ yes |
| `src/lib/resend.ts` | lib | isResendConfigured, getResendClient | no |
| `src/lib/site-data.ts` | lib | NavLink, Mix, HearThisTrack, Video | no |
| `src/lib/utils.ts` | lib | cn | no |

## Entry Points

| Path | Description |
|------|-------------|
| `src/app/page.tsx` | Main SPA shell — renders all sections |
| `src/app/layout.tsx` | Root layout with ThemeProvider |
| `src/app/api/booking/route.ts` | Booking API — validation, DB, email |
| `src/app/api/health/route.ts` | Health probe endpoint |
| `src/app/api/mixcloud-url/route.ts` | Mixcloud stream resolver (yt-dlp) |
| `src/stores/audio-store.ts` | Global audio state (Zustand) |
| `src/lib/site-data.ts` | All static content (mixes, videos, socials) |
| `prisma/schema.prisma` | Database schema (Booking model) |

## Dependency Map

### Internal Import Graph

Files with the most dependents (most imported):

| File | Imported by (N files) |
|------|-----------------------|
| `src/lib/utils` | 44 |
| `src/lib/site-data` | 8 |
| `src/components/ui/button` | 6 |
| `src/hooks/use-in-view` | 5 |
| `src/stores/audio-store` | 5 |
| `src/lib/resend` | 3 |
| `src/lib/db` | 2 |
| `src/components/site/navigation` | 2 |
| `src/components/site/hero` | 2 |
| `src/components/site/about` | 2 |
| `src/components/site/music` | 2 |
| `src/components/site/videos` | 2 |
| `src/components/site/photos` | 2 |
| `src/components/site/bookings` | 2 |
| `src/components/site/footer` | 2 |
| `src/components/site/global-player` | 2 |
| `src/components/site/page-padding` | 2 |
| `src/components/ui/input` | 2 |
| `src/components/ui/label` | 2 |
| `src/hooks/use-toast` | 2 |

### Top External Packages

| Package | Used in N files |
|---------|-----------------|
| `react` | 56 |
| `lucide-react` | 30 |
| `framer-motion` | 8 |
| `class-variance-authority` | 8 |
| `next` | 6 |
| `@radix-ui/react-slot` | 5 |
| `next-themes` | 3 |
| `@prisma/client` | 2 |
| `@radix-ui/react-dialog` | 2 |
| `@radix-ui/react-label` | 2 |
| `zod` | 1 |
| `child_process` | 1 |
| `util` | 1 |
| `path` | 1 |
| `svix` | 1 |
| `@vercel/analytics` | 1 |
| `@radix-ui/react-accordion` | 1 |
| `@radix-ui/react-alert-dialog` | 1 |
| `@radix-ui/react-aspect-ratio` | 1 |
| `@radix-ui/react-avatar` | 1 |

## Hotspots (Frequently Modified Files)

Tracks commit frequency over last 200 commits. High count = higher risk of bugs.

| File | Commits |
|------|---------|
| `package.json` | 6 |
| `package-lock.json` | 5 |
| `README.md` | 5 |
| `src/components/site/music.tsx` | 5 |
| `src/app/layout.tsx` | 4 |
| `docs/.map-state.json` | 4 |
| `docs/codebase-map.json` | 4 |
| `docs/codebase-map.md` | 4 |
| `src/lib/resend.ts` | 3 |
| `src/app/api/webhooks/inbound/route.ts` | 3 |
| `.gitignore` | 3 |
| `dj-kimchi` | 3 |
| `src/lib/site-data.ts` | 2 |
| `scripts/generate-architecture-map.mjs` | 2 |
| `scripts/generate-codebase-map.mjs` | 2 |

## Debugging Zones

| Area | Files | Common Issues |
|------|-------|---------------|
| Booking API | `src/app/api/booking/route.ts` | Rate limiting, Zod validation, DB/email config |
| Database layer | `src/lib/db.ts` | Missing DATABASE_URL env, Prisma connection |
| Audio player | `src/stores/audio-store.ts`, `src/components/site/global-player.tsx` | Mixcloud yt-dlp extraction, stream URL cache |
| Email | `src/lib/resend.ts` | RESEND_API_KEY not set, rate limit |
| Env config | `src/lib/env.ts` | Missing .env variables |
| Health check | `src/app/api/health/route.ts` | DB latency, service status |

## Auto-Update System

The map is automatically regenerated via three mechanisms:

| Trigger | Mechanism | Command |
|---------|-----------|---------|
| After every commit (local) | Git post-commit hook | auto — install with `npm run hooks:install` |
| On push/PR to main | GitHub Actions | `.github/workflows/update-codebase-map.yml` |
| During active development | File watcher | `npm run arch:watch` |
| Manual refresh | One-shot | `npm run arch:update` |

### Incremental Update Strategy

- Each file is SHA-256 hashed and stored in `docs/.map-state.json`.
- On next run, only files with changed hashes are flagged as modified.
- If no file changes AND commit hash is unchanged, generation is skipped.
- `--force` flag bypasses the hash check for full regeneration.

### Significant Change Criteria

- New or deleted source files
- Modified API routes, stores, or lib utilities
- Dependency additions/removals (`package.json` changes)
- Schema changes (`prisma/schema.prisma`)
- Import relationship changes

## Improvement Suggestions

1. **Database persistence** — Set `DATABASE_URL` env var to enable SQLite booking storage.
2. **Email notifications** — Set `RESEND_API_KEY` env var to enable booking emails.
3. **Test coverage** — No test suite exists; add Vitest + React Testing Library.
4. **Type safety for env** — `src/lib/env.ts` could use Zod to validate all env vars at startup.
5. **Mixcloud fallback** — `yt-dlp` dependency is fragile; add a fallback embed mode.
6. **Error monitoring** — No Sentry or equivalent; add for production error tracking.
7. **Rate limiting** — Current in-memory rate limiter resets on restart; consider Redis.
8. **Auth for admin** — Bookings are publicly readable via DB; add admin dashboard with next-auth.

