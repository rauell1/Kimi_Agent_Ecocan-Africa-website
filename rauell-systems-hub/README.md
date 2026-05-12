# Rauell Systems Hub

A full-stack portfolio and systems showcase built with **TanStack Start** (SSR), **React 19**, **TypeScript**, **Tailwind CSS v4**, and deployed on **Vercel**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR) |
| Routing | TanStack Router (file-based) |
| UI | React 19 + Radix UI + shadcn/ui |
| Styling | Tailwind CSS v4 |
| Build tool | Vite 7 |
| Data fetching | TanStack Query |
| Deployment | Vercel (Node.js SSR via serverless function) |
| Package manager | npm |

---

## Project Structure

```
├── src/
│   ├── routes/          # File-based routes (TanStack Router)
│   ├── components/      # Shared UI components
│   └── styles/          # Global styles
├── public/              # Static assets
├── api/
│   └── ssr.js           # Auto-generated Vercel SSR serverless handler
├── scripts/
│   └── build-api.mjs    # Bundles dist/server/server.js → api/ssr.js
├── app.config.ts        # TanStack Start config (server preset: vercel)
├── vite.config.ts       # Vite config with TanStack Start plugin
└── vercel.json          # Vercel deployment config
```

---

## Local Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Building for Production

```bash
npm run build
npm run build:api
```

Vercel runs both steps automatically via the `buildCommand` in `vercel.json`.

---

## Deployment (Vercel)

This project is configured for **Vercel Node.js SSR** deployment:

- **Build command:** `npm run build && npm run build:api`
- **Output directory:** `dist/client` (static assets)
- **SSR handler:** `api/ssr.js` (Vercel serverless function)
- All routes are rewritten to the SSR handler for server-side rendering

---

## Environment Variables

Add required environment variables in Vercel project settings under **Settings → Environment Variables**. For local development, create a `.env.local` file (git-ignored).

---

## Scripts Reference

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build client + SSR bundles |
| `npm run build:api` | Bundle SSR handler for Vercel |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

<!-- deploy: trigger -->
