import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/api.service';
import { MarkdownPipe } from '../shared/markdown.pipe';

/**
 * Rendered from site content managed in the admin panel:
 *   - key "resume"      → markdown body
 *   - key "resume.pdf"  → optional URL for the "Download PDF" button
 */
@Component({
  selector: 'app-resume',
  imports: [MatButtonModule, MatIconModule, MarkdownPipe],
  template: `
    <section class="container section narrow">
      <div class="head">
        <h1>Resume</h1>
        @if (pdfUrl()) {
          <a mat-flat-button color="primary" [href]="pdfUrl()" target="_blank" rel="noreferrer">
            <mat-icon>download</mat-icon> Download PDF
          </a>
        }
      </div>

      @if (markdown()) {
        <div class="markdown-body" [innerHTML]="markdown() | markdown"></div>
      } @else if (loaded()) {
        <p class="muted">Resume not published yet.</p>
      }
    </section>
  `,
  styles: `
    .narrow { max-width: 800px; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    h1 { font-size: 2.2rem; margin: 0; }
    .head mat-icon { margin-right: 4px; }
  `,
})
export default class Resume {
  private readonly api = inject(ApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly content = signal<Record<string, string>>({});
  readonly loaded = signal(false);

  readonly markdown = computed(() => this.content()['resume'] ?? '');
  readonly pdfUrl = computed(() => this.content()['resume.pdf'] ?? '');

  constructor() {
    if (!this.isBrowser) return;
    this.api.getContent().subscribe({
      next: (c) => { this.content.set(c); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }
}
