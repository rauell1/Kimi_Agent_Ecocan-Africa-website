// ─────────────────────────────────────────────────────────────────────────────
// Rauell Systems Hub — Vite config
// SPA mode: React + TanStack Router + Tailwind v4
//
// IMPORTANT — If Lovable regenerates this file, preserve:
//   1. tailwindcss() plugin (required for Tailwind v4 — no tailwind.config.js)
//   2. resolve.alias for node:async_hooks (stubs Node built-in for browser build)
//   3. optimizeDeps.exclude for @tanstack/react-start packages
//   4. build.outDir: 'dist' (Vercel reads from here per vercel.json)
// ─────────────────────────────────────────────────────────────────────────────
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
        },
      },
    },
  },
  resolve: {
    alias: {
      // Stub Node built-in — required while @tanstack/react-start is in node_modules
      'node:async_hooks': '/src/stubs/async-hooks.ts',
    },
  },
  optimizeDeps: {
    exclude: ['@tanstack/react-start', '@tanstack/start-storage-context'],
  },
});
