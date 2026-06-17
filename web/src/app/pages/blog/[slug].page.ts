import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { BlogPostDetail } from '../../core/models';
import { MarkdownPipe } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-post-detail',
  imports: [RouterLink, DatePipe, MarkdownPipe],
  template: `
    <article class="container section narrow">
      <a routerLink="/blog" class="back">← Back to blog</a>
      @if (post(); as p) {
        <div class="post-meta muted">
          @if (p.publishedAt) { {{ p.publishedAt | date: 'mediumDate' }} }
          @for (t of p.tags; track t) { <span class="tag">{{ t }}</span> }
        </div>
        <h1>{{ p.title }}</h1>
        @if (p.coverImageUrl) { <img class="cover" [src]="p.coverImageUrl" [alt]="p.title" /> }
        <div class="markdown-body" [innerHTML]="p.content | markdown"></div>
      } @else if (loaded()) {
        <p class="muted">Post not found.</p>
      }
    </article>
  `,
  styles: `
    .narrow { max-width: 740px; }
    .back { display: inline-block; margin-bottom: 1.5rem; }
    h1 { font-size: 2.4rem; margin: 0.5rem 0 1rem; }
    .post-meta { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; flex-wrap: wrap; }
    .tag { padding: 0.15rem 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--pw-accent) 14%, transparent); color: var(--pw-accent); }
    .cover { width: 100%; border-radius: var(--pw-radius); margin: 1rem 0 1.5rem; }
  `,
})
export default class PostDetail {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly post = signal<BlogPostDetail | null>(null);
  readonly loaded = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.api.getPost(slug).subscribe({
      next: (p) => { this.post.set(p); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }
}
