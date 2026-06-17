import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouteMeta } from '@analogjs/router';
import { AuthService } from '../../core/auth.service';
import { authGuard } from '../../core/auth.guard';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="container section">
      <div class="head">
        <div>
          <h1>Dashboard</h1>
          <p class="muted">Signed in as {{ auth.displayName() }}</p>
        </div>
        <button mat-stroked-button (click)="auth.logout()"><mat-icon>logout</mat-icon> Sign out</button>
      </div>

      <div class="grid">
        <a class="tile card-surface" routerLink="/admin/posts">
          <mat-icon>article</mat-icon>
          <h3>Blog posts</h3>
          <p class="muted">Write, edit and publish posts.</p>
        </a>
        <a class="tile card-surface" routerLink="/admin/projects">
          <mat-icon>folder</mat-icon>
          <h3>Projects</h3>
          <p class="muted">Manage portfolio projects.</p>
        </a>
        <a class="tile card-surface" routerLink="/admin/messages">
          <mat-icon>inbox</mat-icon>
          <h3>Messages</h3>
          <p class="muted">Read contact submissions.</p>
        </a>
      </div>
    </section>
  `,
  styles: `
    .head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
    h1 { font-size: 2rem; margin: 0; }
    .head mat-icon { margin-right: 4px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .tile { display: block; padding: 1.5rem; color: var(--pw-text); transition: border-color .15s ease, transform .15s ease; }
    .tile:hover { text-decoration: none; border-color: var(--pw-accent); transform: translateY(-3px); }
    .tile mat-icon { font-size: 32px; height: 32px; width: 32px; color: var(--pw-accent); }
    .tile h3 { margin: 0.6rem 0 0.3rem; }
  `,
})
export default class AdminDashboard {
  readonly auth = inject(AuthService);
}
