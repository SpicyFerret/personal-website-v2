/// <reference types="vite/client" />

/**
 * Base URL of the .NET API. Empty by default so calls are RELATIVE (`/api/...`) and
 * therefore same-origin — the `/api` path is proxied to the backend (Nitro routeRules
 * in prod, the Vite dev proxy in dev). Set VITE_API_URL only to point at a cross-origin API.
 */
export const API_BASE_URL: string =
  (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

/** Build-time env with a fallback (repo Variables → web.yml → VITE_*). */
function env(key: string, fallback: string): string {
  const value = import.meta.env[key] as string | undefined;
  return value && value.length > 0 ? value : fallback;
}

/** Site identity — override via repo variable SITE_NAME. */
export const SITE_NAME = env('VITE_SITE_NAME', 'Danilo Marques');

/**
 * Social / contact links — override via repo variables
 * SOCIAL_GITHUB, SOCIAL_LINKEDIN, SOCIAL_INSTAGRAM, CONTACT_EMAIL.
 * An empty override hides the link in the UI.
 */
export const SOCIAL_LINKS = {
  github: env('VITE_SOCIAL_GITHUB', 'https://github.com/SpicyFerret'),
  linkedin: env('VITE_SOCIAL_LINKEDIN', 'https://linkedin.com/in/danilo-nmarques'),
  instagram: env('VITE_SOCIAL_INSTAGRAM', ''),
  email: env('VITE_CONTACT_EMAIL', 'danilo@neumannmarques.com'),
};
