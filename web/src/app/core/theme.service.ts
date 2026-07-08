import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_KEY = 'pw_theme';
const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

/**
 * Drives the color scheme by toggling the `light`/`dark` classes on <html>
 * (see styles.scss — everything, including Angular Material's light-dark()
 * tokens, follows `color-scheme`). Persisted in localStorage; an inline
 * script in index.html re-applies it before first paint.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mode = signal<ThemeMode>(this.read());

  constructor() {
    effect(() => {
      const mode = this.mode();
      if (!this.isBrowser) return;
      const root = this.document.documentElement;
      root.classList.remove('light', 'dark');
      if (mode !== 'system') root.classList.add(mode);
      try {
        localStorage.setItem(THEME_KEY, mode);
      } catch {
        /* storage unavailable */
      }
    });
  }

  cycle(): void {
    const next = ORDER[(ORDER.indexOf(this.mode()) + 1) % ORDER.length];
    this.mode.set(next);
  }

  private read(): ThemeMode {
    if (!this.isBrowser) return 'system';
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
      return 'system';
    }
  }
}
