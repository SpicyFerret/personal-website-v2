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
import { QuillEditorComponent } from 'ngx-quill';
import { ApiService } from '../../core/api.service';
import { authGuard } from '../../core/auth.guard';
import { QUILL_MODULES, registerQuillExtensions } from '../../shared/quill-config';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

interface Stat {
  value: string;
  label: string;
}

interface Entry {
  key: string;
  value: string;
  dirty: boolean;
  stats?: Stat[]; // structured editor state for home.stats
  tech?: string; // comma-separated editor state for home.tech
}

/** Well-known keys offered as one-click templates when missing. */
const RICH_KEYS = new Set(['resume', 'home.title', 'home.subtitle', 'home.eyebrow']);

const KNOWN_KEYS: { key: string; hint: string }[] = [
  { key: 'resume', hint: 'Resume page body (rich text)' },
  { key: 'resume.pdf', hint: 'URL of the resume PDF (optional button)' },
  { key: 'home.eyebrow', hint: 'Small line above the home title' },
  { key: 'home.title', hint: 'Home headline (HTML allowed, e.g. <span class="grad">…</span>)' },
  { key: 'home.subtitle', hint: 'Paragraph under the home title' },
  { key: 'home.stats', hint: 'Stat cards (value + label) shown on the home page' },
  { key: 'home.tech', hint: 'Tech chips shown on the home page' },
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
    QuillEditorComponent,
  ],
  template: `
    <section class="container section narrow">
      <a routerLink="/admin" class="muted">← Dashboard</a>
      <h1>Site content</h1>
      <p class="muted">
        Texts that make the site yours — resume, home hero, stats and tech chips.
        Rich text for long content; structured fields for stats/tech.
      </p>

      <mat-accordion multi>
        @for (e of entries(); track e.key) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>{{ e.key }}</mat-panel-title>
              @if (e.dirty) { <mat-panel-description>unsaved</mat-panel-description> }
            </mat-expansion-panel-header>
            @if (isFileUrl(e)) {
              <div class="file-row">
                <mat-form-field appearance="outline" class="grow">
                  <mat-label>URL</mat-label>
                  <input matInput [(ngModel)]="e.value" (ngModelChange)="e.dirty = true" />
                </mat-form-field>
                <button mat-stroked-button (click)="pdfInput.click()" [disabled]="uploading()">
                  <mat-icon>upload_file</mat-icon> {{ uploading() ? 'Uploading…' : 'Upload PDF' }}
                </button>
                <input #pdfInput type="file" hidden accept="application/pdf" (change)="uploadPdf(e, $event)" />
              </div>
            } @else if (isStats(e)) {
              <div class="stats-editor">
                @for (s of e.stats; track $index) {
                  <div class="stat-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Value</mat-label>
                      <input matInput [(ngModel)]="s.value" (ngModelChange)="syncStats(e)" placeholder="4+ yrs" />
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Label</mat-label>
                      <input matInput [(ngModel)]="s.label" (ngModelChange)="syncStats(e)" placeholder=".NET / C#" />
                    </mat-form-field>
                    <button mat-icon-button (click)="removeStat(e, $index)" aria-label="Remove"><mat-icon>close</mat-icon></button>
                  </div>
                }
                <button mat-stroked-button (click)="addStat(e)"><mat-icon>add</mat-icon> Add stat</button>
              </div>
            } @else if (isTech(e)) {
              <mat-form-field appearance="outline" class="full">
                <mat-label>Tech (comma separated)</mat-label>
                <input matInput [(ngModel)]="e.tech" (ngModelChange)="syncTech(e)" placeholder="Angular, .NET, PostgreSQL, Docker" />
              </mat-form-field>
            } @else if (isRich(e)) {
              <quill-editor
                [modules]="quillModules"
                [(ngModel)]="e.value"
                (ngModelChange)="e.dirty = true"
                placeholder="Write here…"
              ></quill-editor>
            } @else {
              <textarea
                class="editor"
                rows="4"
                [(ngModel)]="e.value"
                (ngModelChange)="e.dirty = true"
              ></textarea>
            }
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
    quill-editor { display: block; }
    .file-row { display: flex; gap: 0.5rem; align-items: flex-start; }
    .file-row .grow { flex: 1 1 auto; }
    .full { width: 100%; }
    .stats-editor { display: flex; flex-direction: column; gap: 0.25rem; }
    .stat-row { display: flex; gap: 0.5rem; align-items: center; }
    .stat-row mat-form-field { flex: 1 1 auto; }
    .stat-row button { flex: 0 0 auto; }
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
  readonly uploading = signal(false);
  readonly message = signal('');
  readonly quillModules = QUILL_MODULES;
  newKey = '';

  /** Rich editor (with colors/gradient) for text keys and anything stored as HTML. */
  isRich(e: Entry): boolean {
    return RICH_KEYS.has(e.key) || e.value.trimStart().startsWith('<');
  }

  /** Keys that hold an uploadable file URL. */
  isFileUrl(e: Entry): boolean {
    return e.key === 'resume.pdf';
  }

  isStats(e: Entry): boolean {
    return e.key === 'home.stats';
  }
  isTech(e: Entry): boolean {
    return e.key === 'home.tech';
  }

  /** Populate the structured editor state from the stored JSON string. */
  private initStructured(e: Entry): Entry {
    if (e.key === 'home.stats') {
      let parsed: Stat[] = [];
      try {
        const j = JSON.parse(e.value);
        if (Array.isArray(j)) parsed = j.map((s) => ({ value: s?.value ?? '', label: s?.label ?? '' }));
      } catch {
        /* not JSON yet */
      }
      e.stats = parsed;
    } else if (e.key === 'home.tech') {
      let csv = '';
      try {
        const j = JSON.parse(e.value);
        if (Array.isArray(j)) csv = j.join(', ');
      } catch {
        csv = e.value.startsWith('[') ? '' : e.value; // tolerate old plain text
      }
      e.tech = csv;
    }
    return e;
  }

  addStat(e: Entry): void {
    e.stats = [...(e.stats ?? []), { value: '', label: '' }];
    this.syncStats(e);
  }
  removeStat(e: Entry, i: number): void {
    e.stats = (e.stats ?? []).filter((_, idx) => idx !== i);
    this.syncStats(e);
  }
  syncStats(e: Entry): void {
    e.value = JSON.stringify((e.stats ?? []).filter((s) => s.value || s.label));
    e.dirty = true;
  }
  syncTech(e: Entry): void {
    const arr = (e.tech ?? '').split(',').map((t) => t.trim()).filter(Boolean);
    e.value = JSON.stringify(arr);
    e.dirty = true;
  }

  constructor() {
    registerQuillExtensions();
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
          .map(([key, value]) => this.initStructured({ key, value, dirty: false }))
          .sort((a, b) => a.key.localeCompare(b.key)),
      );
    });
  }

  add(key: string): void {
    key = key.trim();
    if (!key || this.entries().some((e) => e.key === key)) return;
    this.entries.update((list) =>
      [...list, this.initStructured({ key, value: '', dirty: true })].sort((a, b) =>
        a.key.localeCompare(b.key),
      ),
    );
    this.newKey = '';
  }

  uploadPdf(entry: Entry, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadAsset(file, 'resume').subscribe({
      next: (res) => {
        entry.value = res.url;
        entry.dirty = true;
        this.uploading.set(false);
        this.message.set('PDF uploaded — click Save to persist the URL.');
      },
      error: () => {
        this.uploading.set(false);
        this.message.set('PDF upload failed.');
      },
    });
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
