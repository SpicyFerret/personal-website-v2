import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouteMeta } from '@analogjs/router';
import { ApiService } from '../../core/api.service';
import { authGuard } from '../../core/auth.guard';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

interface Entry {
  key: string;
  value: string;
  dirty: boolean;
}

/** Well-known keys offered as one-click templates when missing. */
const KNOWN_KEYS: { key: string; hint: string }[] = [
  { key: 'resume', hint: 'Resume page body (markdown)' },
  { key: 'resume.pdf', hint: 'URL of the resume PDF (optional button)' },
  { key: 'home.eyebrow', hint: 'Small line above the home title' },
  { key: 'home.title', hint: 'Home headline (HTML allowed, e.g. <span class="grad">…</span>)' },
  { key: 'home.subtitle', hint: 'Paragraph under the home title' },
  { key: 'home.stats', hint: 'JSON: [{"value":"4+ yrs","label":".NET"}]' },
  { key: 'home.tech', hint: 'JSON: ["Angular",".NET","PostgreSQL"]' },
];

@Component({
  selector: 'app-admin-content',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  template: `
    <section class="container section narrow">
      <a routerLink="/admin" class="muted">← Dashboard</a>
      <h1>Site content</h1>
      <p class="muted">
        Texts that make the site yours — resume, home hero, etc. Markdown/JSON per key.
      </p>

      <mat-accordion multi>
        @for (e of entries(); track e.key) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>{{ e.key }}</mat-panel-title>
              @if (e.dirty) { <mat-panel-description>unsaved</mat-panel-description> }
            </mat-expansion-panel-header>
            <textarea
              class="editor"
              [rows]="e.key === 'resume' ? 18 : 4"
              [(ngModel)]="e.value"
              (ngModelChange)="e.dirty = true"
            ></textarea>
            <div class="row-actions">
              <button mat-flat-button color="primary" [disabled]="!e.dirty || saving()" (click)="save(e)">
                <mat-icon>save</mat-icon> Save
              </button>
              <button mat-button (click)="remove(e)"><mat-icon>delete</mat-icon> Delete</button>
            </div>
          </mat-expansion-panel>
        }
      </mat-accordion>

      <h2>Add key</h2>
      <div class="known">
        @for (k of missingKnown(); track k.key) {
          <button mat-stroked-button (click)="add(k.key)" [matTooltip]="k.hint">
            <mat-icon>add</mat-icon> {{ k.key }}
          </button>
        }
      </div>
      <div class="custom">
        <mat-form-field appearance="outline">
          <mat-label>Custom key</mat-label>
          <input matInput [(ngModel)]="newKey" placeholder="ex.: about.body" />
        </mat-form-field>
        <button mat-stroked-button (click)="add(newKey)" [disabled]="!newKey.trim()">
          <mat-icon>add</mat-icon> Add
        </button>
      </div>

      @if (message()) { <p class="msg">{{ message() }}</p> }
    </section>
  `,
  styles: `
    .narrow { max-width: 860px; }
    h1 { font-size: 1.8rem; margin: 0.25rem 0 0.25rem; }
    h2 { font-size: 1.2rem; margin-top: 2rem; }
    mat-accordion { display: block; margin-top: 1.5rem; }
    .editor {
      width: 100%;
      font-family: 'Roboto Mono', ui-monospace, monospace;
      font-size: 0.9rem;
      background: var(--pw-surface);
      color: var(--pw-text);
      border: 1px solid var(--pw-border);
      border-radius: 8px;
      padding: 0.8rem;
      resize: vertical;
    }
    .row-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .row-actions mat-icon, .known mat-icon, .custom mat-icon { margin-right: 4px; }
    .known { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .custom { display: flex; gap: 0.5rem; align-items: center; }
    .custom mat-form-field { flex: 1 1 auto; }
    .msg { color: var(--pw-accent); }
  `,
})
export default class AdminContent {
  private readonly api = inject(ApiService);

  readonly entries = signal<Entry[]>([]);
  readonly saving = signal(false);
  readonly message = signal('');
  newKey = '';

  constructor() {
    this.load();
  }

  missingKnown() {
    const existing = new Set(this.entries().map((e) => e.key));
    return KNOWN_KEYS.filter((k) => !existing.has(k.key));
  }

  private load(): void {
    this.api.getContent().subscribe((map) => {
      this.entries.set(
        Object.entries(map)
          .map(([key, value]) => ({ key, value, dirty: false }))
          .sort((a, b) => a.key.localeCompare(b.key)),
      );
    });
  }

  add(key: string): void {
    key = key.trim();
    if (!key || this.entries().some((e) => e.key === key)) return;
    this.entries.update((list) =>
      [...list, { key, value: '', dirty: true }].sort((a, b) => a.key.localeCompare(b.key)),
    );
    this.newKey = '';
  }

  save(entry: Entry): void {
    this.saving.set(true);
    this.api.saveContent(entry.key, entry.value).subscribe({
      next: () => {
        entry.dirty = false;
        this.saving.set(false);
        this.message.set(`"${entry.key}" saved.`);
      },
      error: () => {
        this.saving.set(false);
        this.message.set(`Failed to save "${entry.key}".`);
      },
    });
  }

  remove(entry: Entry): void {
    if (!confirm(`Delete content key "${entry.key}"?`)) return;
    this.api.deleteContent(entry.key).subscribe({
      next: () => this.entries.update((l) => l.filter((e) => e.key !== entry.key)),
      // 404 = never saved; just drop it locally.
      error: () => this.entries.update((l) => l.filter((e) => e.key !== entry.key)),
    });
  }
}
