import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { Project } from '../../core/models';
import { MarkdownPipe } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, MatIconModule, MatButtonModule, MarkdownPipe],
  template: `
    <article class="container section">
      <a routerLink="/projects" class="back">← Back to projects</a>
      @if (project(); as p) {
        <h1>{{ p.title }}</h1>
        <p class="muted lead">{{ p.summary }}</p>
        <div class="tags">
          @for (t of p.techStack; track t) { <span class="tag">{{ t }}</span> }
        </div>
        <div class="actions">
          @if (p.repoUrl) {
            <a mat-stroked-button [href]="p.repoUrl" target="_blank" rel="noreferrer">
              <mat-icon>code</mat-icon> Repository
            </a>
          }
          @if (p.liveUrl) {
            <a mat-flat-button color="primary" [href]="p.liveUrl" target="_blank" rel="noreferrer">
              <mat-icon>open_in_new</mat-icon> Live demo
            </a>
          }
        </div>
        <div class="markdown-body" [innerHTML]="p.description | markdown"></div>
      } @else if (loaded()) {
        <p class="muted">Project not found.</p>
      }
    </article>
  `,
  styles: `
    .back { display: inline-block; margin-bottom: 1.5rem; }
    h1 { font-size: 2.4rem; margin: 0 0 0.5rem; }
    .lead { font-size: 1.15rem; max-width: 680px; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 1rem 0; }
    .tag { font-size: 0.78rem; padding: 0.25rem 0.7rem; border-radius: 999px; background: color-mix(in srgb, var(--pw-accent) 14%, transparent); color: var(--pw-accent); }
    .actions { display: flex; gap: 0.75rem; margin: 1.5rem 0; flex-wrap: wrap; }
    .actions mat-icon { margin-right: 4px; }
  `,
})
export default class ProjectDetail {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly project = signal<Project | null>(null);
  readonly loaded = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.getProject(slug).subscribe({
      next: (p) => { this.project.set(p); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }
}
