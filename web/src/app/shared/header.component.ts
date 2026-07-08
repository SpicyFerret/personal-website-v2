import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { SITE_NAME } from '../core/config';

const THEME_ICONS = { system: 'contrast', light: 'light_mode', dark: 'dark_mode' } as const;
const THEME_LABELS = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' } as const;

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <header class="hdr">
      <div class="container hdr-inner">
        <a routerLink="/" class="brand">
          <span class="brand-mark">{{ initials }}</span>
          <span class="brand-name">{{ siteName }}</span>
        </a>

        <nav class="nav" [class.open]="menuOpen">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.path === '/' }"
              (click)="menuOpen = false"
              >{{ link.label }}</a
            >
          }
          @if (auth.isAuthenticated()) {
            <a routerLink="/admin" routerLinkActive="active" (click)="menuOpen = false">Admin</a>
          }
        </nav>

        <div class="actions">
          <button
            mat-icon-button
            [matTooltip]="themeLabel()"
            aria-label="Toggle theme"
            (click)="theme.cycle()"
          >
            <mat-icon>{{ themeIcon() }}</mat-icon>
          </button>
          <button
            class="menu-btn"
            mat-icon-button
            aria-label="Toggle menu"
            (click)="menuOpen = !menuOpen"
          >
            <mat-icon>{{ menuOpen ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: `
    .hdr {
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: saturate(180%) blur(12px);
      background: color-mix(in srgb, var(--pw-bg) 80%, transparent);
      border-bottom: 1px solid var(--pw-border);
    }
    .hdr-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      gap: 0.5rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--pw-text);
      font-weight: 700;
    }
    .brand:hover { text-decoration: none; }
    .brand-mark {
      display: inline-grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2));
      color: #fff;
      font-weight: 800;
      font-size: 0.85rem;
    }
    .nav {
      display: flex;
      gap: 1.4rem;
      align-items: center;
    }
    .nav a {
      color: var(--pw-muted);
      font-weight: 500;
      font-size: 0.95rem;
    }
    .nav a:hover { color: var(--pw-text); text-decoration: none; }
    .nav a.active { color: var(--pw-text); }
    .actions { display: flex; align-items: center; }
    .menu-btn { display: none; }

    @media (max-width: 760px) {
      .menu-btn { display: inline-flex; }
      .nav {
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        flex-direction: column;
        gap: 0.25rem;
        padding: 1rem 1.25rem;
        background: var(--pw-bg);
        border-bottom: 1px solid var(--pw-border);
        display: none;
      }
      .nav.open { display: flex; }
      .nav a { padding: 0.5rem 0; width: 100%; }
    }
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  readonly siteName = SITE_NAME;
  readonly initials = SITE_NAME.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  readonly themeIcon = computed(() => THEME_ICONS[this.theme.mode()]);
  readonly themeLabel = computed(() => THEME_LABELS[this.theme.mode()]);

  menuOpen = false;

  readonly links = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/resume', label: 'Resume' },
    { path: '/contact', label: 'Contact' },
  ];
}
