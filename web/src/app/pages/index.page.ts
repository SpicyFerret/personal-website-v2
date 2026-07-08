import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../core/api.service';
import { BlogPostSummary, Project } from '../core/models';
import { SOCIAL_LINKS } from '../core/config';

interface Stat {
  value: string;
  label: string;
}

/**
 * Hero copy comes from site content (admin panel) with generic fallbacks:
 *   home.eyebrow, home.title (HTML allowed), home.subtitle,
 *   home.stats → JSON [{ "value": "4+ yrs", "label": ".NET" }, ...]
 *   home.tech  → JSON ["Angular", ".NET", ...]
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <!-- Hero -->
    <section class="hero container">
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h1 class="hero-title" [innerHTML]="title()"></h1>
      <p class="hero-sub muted">{{ subtitle() }}</p>
      <div class="hero-cta">
        <a mat-flat-button color="primary" routerLink="/projects">
          <mat-icon>folder_open</mat-icon> View projects
        </a>
        <a mat-stroked-button routerLink="/contact">
          <mat-icon>mail</mat-icon> Get in touch
        </a>
        @if (social.linkedin) {
          <a mat-button [href]="social.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>
        }
      </div>
    </section>

    <!-- Stats -->
    @if (stats().length) {
      <section class="container stats" [style.grid-template-columns]="'repeat(' + stats().length + ', 1fr)'">
        @for (s of stats(); track s.label) {
          <div class="stat card-surface">
            <div class="stat-num">{{ s.value }}</div>
            <div class="muted">{{ s.label }}</div>
          </div>
        }
      </section>
    }

    <!-- Tech -->
    @if (tech().length) {
      <section class="container">
        <mat-chip-set aria-label="Tech stack">
          @for (t of tech(); track t) { <mat-chip>{{ t }}</mat-chip> }
        </mat-chip-set>
      </section>
    }

    <!-- Featured projects -->
    <section class="container section">
      <div class="section-head">
        <h2>Featured projects</h2>
        <a routerLink="/projects">All projects →</a>
      </div>
      <div class="grid">
        @for (p of featured(); track p.id) {
          <a class="proj card-surface" [routerLink]="['/projects', p.slug]">
            <h3>{{ p.title }}</h3>
            <p class="muted">{{ p.summary }}</p>
            <div class="tags">
              @for (t of p.techStack; track t) { <span class="tag">{{ t }}</span> }
            </div>
          </a>
        } @empty {
          <p class="muted">Projects coming soon.</p>
        }
      </div>
    </section>

    <!-- Latest posts -->
    <section class="container section">
      <div class="section-head">
        <h2>From the blog</h2>
        <a routerLink="/blog">All posts →</a>
      </div>
      <div class="grid">
        @for (post of posts(); track post.id) {
          <a class="proj card-surface" [routerLink]="['/blog', post.slug]">
            <h3>{{ post.title }}</h3>
            <p class="muted">{{ post.excerpt }}</p>
          </a>
        } @empty {
          <p class="muted">No posts yet.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .hero { padding: 4.5rem 1.25rem 2rem; text-align: center; }
    .eyebrow { color: var(--pw-accent); font-weight: 600; letter-spacing: 0.02em; margin: 0 0 0.75rem; }
    .hero-title { font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 800; margin: 0 0 1rem; }
    .hero-sub { max-width: 720px; margin: 0 auto 1.75rem; font-size: 1.1rem; }
    .hero-cta { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    .hero-cta mat-icon { margin-right: 4px; }

    .stats {
      display: grid;
      gap: 1rem;
      margin: 2.5rem auto;
    }
    .stat { padding: 1.25rem; text-align: center; }
    .stat-num { font-size: 1.8rem; font-weight: 800; }
    @media (max-width: 720px) { .stats { grid-template-columns: repeat(2, 1fr) !important; } }

    .section-head {
      display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.25rem;
    }
    .section-head h2 { margin: 0; font-size: 1.6rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .proj { display: block; padding: 1.4rem; color: var(--pw-text); transition: transform .15s ease, border-color .15s ease; }
    .proj:hover { text-decoration: none; transform: translateY(-3px); border-color: var(--pw-accent); }
    .proj h3 { margin: 0 0 0.5rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.8rem; }
    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: color-mix(in srgb, var(--pw-accent) 14%, transparent); color: var(--pw-accent); }
  `,
})
export default class Home {
  private readonly api = inject(ApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly content = signal<Record<string, string>>({});
  readonly featured = signal<Project[]>([]);
  readonly posts = signal<BlogPostSummary[]>([]);
  readonly social = SOCIAL_LINKS;

  readonly eyebrow = computed(() => this.content()['home.eyebrow'] || 'Welcome');
  readonly title = computed(
    () => this.content()['home.title'] || 'Hi — I build <span class="grad">things for the web</span>.',
  );
  readonly subtitle = computed(
    () => this.content()['home.subtitle'] || 'Projects, writing and a bit about me.',
  );
  readonly stats = computed<Stat[]>(() => this.parseJson<Stat[]>('home.stats', []));
  readonly tech = computed<string[]>(() => this.parseJson<string[]>('home.tech', []));

  constructor() {
    if (this.isBrowser) {
      this.api.getContent().subscribe((c) => this.content.set(c));
      this.api.getProjects(true).subscribe((p) => this.featured.set(p.slice(0, 4)));
      this.api.getPosts().subscribe((p) => this.posts.set(p.slice(0, 3)));
    }
  }

  private parseJson<T>(key: string, fallback: T): T {
    const raw = this.content()[key];
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
}
