import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { Project } from '../../core/models';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, MatIconModule],
  template: `
    <section class="container section">
      <h1>Projects</h1>
      <p class="muted">Selected work — from institutional platforms to side projects.</p>

      <div class="grid">
        @for (p of projects(); track p.id) {
          <div class="proj card-surface">
            <a [routerLink]="['/projects', p.slug]" class="proj-title"><h3>{{ p.title }}</h3></a>
            <p class="muted">{{ p.summary }}</p>
            <div class="tags">
              @for (t of p.techStack; track t) { <span class="tag">{{ t }}</span> }
            </div>
            <div class="links">
              @if (p.repoUrl) {
                <a [href]="p.repoUrl" target="_blank" rel="noreferrer"><mat-icon>code</mat-icon> Code</a>
              }
              @if (p.liveUrl) {
                <a [href]="p.liveUrl" target="_blank" rel="noreferrer"><mat-icon>open_in_new</mat-icon> Live</a>
              }
              <a [routerLink]="['/projects', p.slug]">Details →</a>
            </div>
          </div>
        } @empty {
          <p class="muted">No projects published yet.</p>
        }
      </div>
    </section>
  `,
  styles: `
    h1 { font-size: 2.2rem; margin-bottom: 0.25rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .proj { padding: 1.5rem; }
    .proj-title { color: var(--pw-text); }
    .proj h3 { margin: 0 0 0.5rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.8rem 0; }
    .tag { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: color-mix(in srgb, var(--pw-accent) 14%, transparent); color: var(--pw-accent); }
    .links { display: flex; gap: 1rem; font-size: 0.9rem; margin-top: 0.5rem; }
    .links a { display: inline-flex; align-items: center; gap: 0.25rem; }
    .links mat-icon { font-size: 18px; height: 18px; width: 18px; }
  `,
})
export default class Projects {
  private readonly api = inject(ApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly projects = signal<Project[]>([]);

  constructor() {
    if (this.isBrowser) this.api.getProjects().subscribe((p) => this.projects.set(p));
  }
}
