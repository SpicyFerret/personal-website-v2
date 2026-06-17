/// <reference types="vite/client" />

/**
 * Base URL of the .NET API. Empty by default so calls are RELATIVE (`/api/...`) and
 * therefore same-origin — the `/api` path is proxied to the backend (Nitro routeRules
 * in prod, the Vite dev proxy in dev). Set VITE_API_URL only to point at a cross-origin API.
 */
export const API_BASE_URL: string =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

/** Public social / contact links shown across the site. */
export const SOCIAL_LINKS = {
  github: 'https://github.com/', // TODO: set your handle
  linkedin: 'https://linkedin.com/in/danilo-nmarques',
  instagram: 'https://instagram.com/', // TODO: set your handle
  email: 'danilo@neumannmarques.com',
};
