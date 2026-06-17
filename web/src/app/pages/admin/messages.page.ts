import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouteMeta } from '@analogjs/router';
import { ApiService } from '../../core/api.service';
import { ContactSubmission } from '../../core/models';
import { authGuard } from '../../core/auth.guard';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-admin-messages',
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule],
  template: `
    <section class="container section narrow">
      <a routerLink="/admin" class="muted">← Dashboard</a>
      <h1>Messages</h1>

      <div class="rows">
        @for (m of messages(); track m.id) {
          <div class="row card-surface" [class.unread]="!m.isRead">
            <div class="row-head">
              <div>
                <strong>{{ m.name }}</strong>
                <a [href]="'mailto:' + m.email" class="muted">&lt;{{ m.email }}&gt;</a>
              </div>
              <span class="muted small">{{ m.createdAt | date: 'medium' }}</span>
            </div>
            @if (m.subject) { <div class="subject">{{ m.subject }}</div> }
            <p class="msg">{{ m.message }}</p>
            <div class="actions">
              @if (!m.isRead) {
                <button mat-button (click)="markRead(m)"><mat-icon>mark_email_read</mat-icon> Mark read</button>
              }
              <a mat-button [href]="'mailto:' + m.email"><mat-icon>reply</mat-icon> Reply</a>
              <button mat-button (click)="remove(m)"><mat-icon>delete</mat-icon> Delete</button>
            </div>
          </div>
        } @empty {
          <p class="muted">No messages yet.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .narrow { max-width: 760px; }
    h1 { font-size: 1.8rem; margin: 0.25rem 0 1.5rem; }
    .rows { display: flex; flex-direction: column; gap: 0.8rem; }
    .row { padding: 1.2rem; }
    .row.unread { border-left: 3px solid var(--pw-accent); }
    .row-head { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .subject { font-weight: 600; margin-top: 0.5rem; }
    .msg { white-space: pre-wrap; margin: 0.5rem 0; }
    .actions { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .actions mat-icon { margin-right: 4px; font-size: 18px; height: 18px; width: 18px; }
    .small { font-size: 0.8rem; }
  `,
})
export default class AdminMessages {
  private readonly api = inject(ApiService);
  readonly messages = signal<ContactSubmission[]>([]);

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.getMessages().subscribe((m) => this.messages.set(m));
  }

  markRead(m: ContactSubmission): void {
    this.api.markMessageRead(m.id).subscribe(() => this.load());
  }

  remove(m: ContactSubmission): void {
    if (!confirm('Delete this message?')) return;
    this.api.deleteMessage(m.id).subscribe(() => this.load());
  }
}
