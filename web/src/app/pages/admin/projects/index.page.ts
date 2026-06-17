import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouteMeta } from '@analogjs/router';
import { ApiService } from '../../../core/api.service';
import { Project } from '../../../core/models';
import { authGuard } from '../../../core/auth.guard';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-admin-projects',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="container section">
      <div class="head">
        <div>
          <a routerLink="/admin" class="muted">← Dashboard</a>
          <h1>Projects</h1>
        </div>
        <a mat-flat-button color="primary" [routerLink]="['/admin/projects', 'new']">
          <mat-icon>add</mat-icon> New project
        </a>
      </div>

      <div class="rows">
        @for (p of projects(); track p.id) {
          <div class="row card-surface">
            <div class="info">
              <a [routerLink]="['/admin/projects', p.id]"><strong>{{ p.title }}</strong></a>
              @if (p.isFeatured) { <span class="badge live">Featured</span> }
              <div class="muted small">/{{ p.slug }} · order {{ p.sortOrder }}</div>
            </div>
            <div class="actions">
              <a mat-icon-button [routerLink]="['/admin/projects', p.id]" aria-label="Edit"><mat-icon>edit</mat-icon></a>
              <button mat-icon-button (click)="remove(p)" aria-label="Delete"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
        } @empty {
          <p class="muted">No projects yet.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
    h1 { font-size: 1.8rem; margin: 0.25rem 0 0; }
    .head mat-icon { margin-right: 4px; }
    .rows { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1.5rem; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; }
    .info { display: flex; flex-direction: column; gap: 0.2rem; }
    .badge { align-self: flex-start; font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 999px; border: 1px solid var(--pw-border); }
    .badge.live { color: var(--pw-accent); border-color: var(--pw-accent); }
    .small { font-size: 0.8rem; }
  `,
})
export default class AdminProjects {
  private readonly api = inject(ApiService);
  readonly projects = signal<Project[]>([]);

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.getProjects().subscribe((p) => this.projects.set(p));
  }

  remove(p: Project): void {
    if (!confirm(`Delete "${p.title}"?`)) return;
    this.api.deleteProject(p.id).subscribe(() => this.load());
  }
}
