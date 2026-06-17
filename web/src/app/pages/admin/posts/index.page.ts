import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouteMeta } from '@analogjs/router';
import { ApiService } from '../../../core/api.service';
import { BlogPostSummary } from '../../../core/models';
import { authGuard } from '../../../core/auth.guard';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-admin-posts',
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule],
  template: `
    <section class="container section">
      <div class="head">
        <div>
          <a routerLink="/admin" class="muted">← Dashboard</a>
          <h1>Blog posts</h1>
        </div>
        <a mat-flat-button color="primary" [routerLink]="['/admin/posts', 'new']">
          <mat-icon>add</mat-icon> New post
        </a>
      </div>

      <div class="rows">
        @for (p of posts(); track p.id) {
          <div class="row card-surface">
            <div class="info">
              <a [routerLink]="['/admin/posts', p.id]"><strong>{{ p.title }}</strong></a>
              <span class="badge" [class.live]="p.isPublished">
                {{ p.isPublished ? 'Published' : 'Draft' }}
              </span>
              <div class="muted small">
                /{{ p.slug }}
                @if (p.publishedAt) { · {{ p.publishedAt | date: 'mediumDate' }} }
              </div>
            </div>
            <div class="actions">
              <a mat-icon-button [routerLink]="['/admin/posts', p.id]" aria-label="Edit"><mat-icon>edit</mat-icon></a>
              <button mat-icon-button (click)="remove(p)" aria-label="Delete"><mat-icon>delete</mat-icon></button>
            </div>
          </div>
        } @empty {
          <p class="muted">No posts yet. Create your first one.</p>
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
    .badge { align-self: flex-start; font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 999px; background: var(--pw-surface); border: 1px solid var(--pw-border); }
    .badge.live { color: #16a34a; border-color: #16a34a; }
    .small { font-size: 0.8rem; }
  `,
})
export default class AdminPosts {
  private readonly api = inject(ApiService);
  readonly posts = signal<BlogPostSummary[]>([]);

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.getAllPosts().subscribe((p) => this.posts.set(p));
  }

  remove(p: BlogPostSummary): void {
    if (!confirm(`Delete "${p.title}"?`)) return;
    this.api.deletePost(p.id).subscribe(() => this.load());
  }
}
