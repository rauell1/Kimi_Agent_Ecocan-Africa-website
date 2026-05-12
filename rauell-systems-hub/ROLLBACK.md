# Rollback Guide — Rauell Systems Hub

This document records every significant commit on `main` and provides exact rollback commands for each. The most recent state is at the top.

---

## How to Rollback

### Soft rollback (keep changes staged, undo commit)
```bash
git revert <sha>          # creates a new revert commit — safest for shared branches
```

### Hard rollback (reset branch to a specific commit)
```bash
# ⚠️ Destructive — rewrites history. Only use on non-shared branches.
git reset --hard <sha>
git push --force-with-lease origin main
```

### Restore a single file from a past commit
```bash
git checkout <sha> -- <path/to/file>
git commit -m "restore: <file> from <sha>"
```

---

## Commit History

<!-- ROLLBACK_LOG_START -->

### `76e5e34` — 2026-04-28 · Roy Okola
**fix: wire Vercel SSR correctly + update README**
- `vite.config.ts` — removed `@lovable.dev/vite-tanstack-config`; switched to native `@tanstack/react-start/plugin/vite` so `app.config.ts preset:'vercel'` is respected
- `vercel.json` — added `buildCommand: npm run build && npm run build:api`, `outputDirectory: dist/client`, SSR catch-all route rewrite to `api/ssr`
- `README.md` — full documentation of stack, deployment architecture, scripts, and project structure

```bash
# Rollback this commit
git revert 76e5e342e032a903dcced8adaed013129e995244
```

---

### `9683b6f` — 2026-04-28 · Roy Okola
**fix: restore original entry files and use node adapter for Vercel**
- Restored `src/client.tsx` and entry point wiring
- Switched server preset to node adapter

```bash
git revert 9683b6f85ae8d16dd4904415d55d9a11480a053c
```

---

### `086ed5a` — 2026-04-28 · Roy Okola
**fix: wire client.tsx to getRouter and add script tag to index.html**
- Connected `client.tsx` hydration to `getRouter()`
- Added `<script>` module tag to `index.html`

```bash
git revert 086ed5a7c503b0fc2110250a8c7e0d86a4089f39
```

---

### `78341f7` — 2026-04-28 · Roy Okola
**fix: revert to @lovable.dev config + SPA mode for Vercel**
- Re-applied `@lovable.dev/vite-tanstack-config`
- Attempted SPA fallback routing via `vercel.json`

```bash
git revert 78341f78365c011ac2e43929c075b008e3e0764f
```

---

### `19c6620` — 2026-04-28 · Roy Okola
**fix: add build:api script and esbuild dev dependency**
- Added `build:api` to `package.json` scripts
- Added `esbuild` as devDependency

```bash
git revert 19c662081fbf781d60a283a5f4389188694cdaa3
```

---

### `01e35e2` — 2026-04-28 · Roy Okola
**fix: bundle SSR server into api function using vercel build script**
- Added `scripts/build-api.mjs` — bundles `dist/server/server.js` → `api/ssr.js` via esbuild
- Added `api/ssr.js` placeholder

```bash
git revert 01e35e29d5bc52a94cd5e6ae75ecd6e32c12350c
```

---

### `c643591` — 2026-04-28 · Roy Okola
**fix: use dist/client output with SSR catch-all via vercel.json routes**
- Set `outputDirectory` to `dist/client`
- Added route rewrite in `vercel.json`

```bash
git revert c643591196295158d78186a6104ed0558ede4496
```

---

### `2ee64c2` — 2026-04-28 · Roy Okola
**fix: switch to TanStack Start vercel target adapter**
- Updated `app.config.ts` to set `server.preset: 'vercel'`

```bash
git revert 2ee64c207bb14824e1a9d971fe441639d5474f18
```

---

### `edab5b3` — 2026-04-28 · Roy Okola
**fix: add vercel.json for SPA routing and correct output directory**
- Initial `vercel.json` with SPA rewrite and `framework: null`

```bash
git revert edab5b3bb9fc826dd7b2be4213ca17b31464642b
```

---

### `8ca73b0` — 2026-04-28 · lovable-dev[bot]
**Revised System Narrative layout**
- UI layout changes to `systems.tsx` narrative section

```bash
git revert 8ca73b0d9c456dbf5ae50e2e35c1f420ff89f006
```

---

### `cb43df6` — 2026-04-28 · lovable-dev[bot]
**Rewrote System Narrative copy**
- Content/copy updates to systems route

```bash
git revert cb43df67862ae1fb531e14ab01c13948260b77c6
```

---

### `077d3c6` — 2026-04-28 · lovable-dev[bot]
**Added terminal commands & features**
- Added terminal-style command display to `ai-lab.tsx`
- Feature additions to AI Lab page

```bash
git revert 077d3c65cc005181d73c2614242213a72d90b810
```

---

### `e3817b2` — 2026-04-28 · lovable-dev[bot]
**Built Rauell website routes**
- Initial scaffolding of all routes: `index.tsx`, `about.tsx`, `ai-lab.tsx`, `contact.tsx`, `projects.tsx`, `systems.tsx`
- `__root.tsx` layout with nav
- `router.tsx`, `client.tsx`, `routeTree.gen.ts`
- `src/styles.css` global styles
- `src/components/`, `src/hooks/`, `src/lib/` directories

```bash
git revert e3817b214c263b1a061f626f05c03aee6f4b42b3
```

<!-- ROLLBACK_LOG_END -->

---

## Emergency: Full Reset to a Known-Good State

The last known fully working Vercel deployment was built from commit `76e5e34`.

```bash
# To redeploy a specific commit to Vercel manually:
git checkout 76e5e342e032a903dcced8adaed013129e995244
# Then push to a temporary branch and promote via Vercel dashboard
```

---

> This file is maintained manually and via the `update-codebase-map` GitHub Action.
> Add a new entry under `ROLLBACK_LOG_START` after every meaningful commit.
