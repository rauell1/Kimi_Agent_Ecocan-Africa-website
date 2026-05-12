# Deployment Notes

## Stack
- **Framework:** React 19 + TanStack Router (SPA mode)
- **Styles:** Tailwind CSS v4 (Vite plugin — no tailwind.config.js)
- **Build:** Vite 7
- **Deploy:** Vercel (static SPA)

## ⚠️ If Lovable Regenerates `vite.config.ts`

Lovable was originally configured for TanStack Start (SSR/Cloudflare). It may attempt to restore the following **which will break the build**:

| What Lovable may add | Why it breaks Vercel |
|---|---|
| `tanstackStart()` plugin | SSR plugin — pulls in `node:async_hooks`, fails browser build |
| `@cloudflare/vite-plugin` | Cloudflare Workers target — incompatible with Vercel |
| `import appCss from '../styles.css?url'` in `__root.tsx` | SSR asset URL pattern — invalid in SPA builds |
| `HeadContent`, `Scripts`, `shellComponent` in `__root.tsx` | SSR-only APIs — no browser equivalent |

**After any Lovable update, verify `vite.config.ts` still contains:**
```ts
import tailwindcss from '@tailwindcss/vite';
// ...
plugins: [
  TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
  react(),
  tailwindcss(), // ← must be present
  viteTsConfigPaths(),
],
resolve: {
  alias: { 'node:async_hooks': '/src/stubs/async-hooks.ts' },
},
```

**`__root.tsx` must use only:**
```ts
import { Outlet, Link, createRootRoute } from '@tanstack/react-router';
// No: HeadContent, Scripts, shellComponent, head(), appCss?url
```

**`src/main.tsx` must use `createRoot`, not `hydrateRoot`:**
```ts
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')!).render(...);
```

## Removing `@tanstack/react-start` Completely

Once you can run locally:
```bash
npm remove @tanstack/react-start
```
Then delete `src/stubs/async-hooks.ts` and remove the `resolve.alias` from `vite.config.ts`.

## Vercel Settings
- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
