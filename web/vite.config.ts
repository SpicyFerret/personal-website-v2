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
      // Gera o HTML destas rotas no build, servido como arquivo estático: sem
      // render por request e sem espera de JS no primeiro paint. Só entram as
      // rotas que não leem dados — /consultoria não chama a API e /contact só
      // faz POST no envio.
      //
      // Home, blog, projetos e resume ficam de fora de propósito: o conteúdo
      // delas vem do CMS via API, e congelá-lo no build faria as edições do
      // admin só aparecerem no próximo deploy.
      prerender: {
        routes: ['/consultoria', '/contact'],
      },
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
