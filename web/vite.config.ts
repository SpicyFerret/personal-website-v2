/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

// Where `/api/*` is forwarded to. Defaults to the local API; in CI set
// API_PROXY_TARGET to the backend's (tunnel) origin so the Cloudflare worker proxies it.
const apiProxyTarget = process.env['API_PROXY_TARGET'] ?? 'http://localhost:5256';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  // Dev server: same-origin /api during `npm run dev`.
  server: {
    proxy: {
      '/api': { target: apiProxyTarget, changeOrigin: true },
    },
  },
  plugins: [
    analog({
      nitro: {
        // Prod/SSR: the built server (incl. the Cloudflare worker) proxies /api → backend.
        routeRules: {
          '/api/**': { proxy: `${apiProxyTarget}/api/**` },
        },
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
}));
