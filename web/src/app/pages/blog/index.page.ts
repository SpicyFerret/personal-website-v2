import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { BlogPostSummary } from '../../core/models';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="container section">
      <h1>Blog</h1>
      <p class="muted">Notes on .NET, Angular, DevOps and things I learn along the way.</p>

      <div class="list">
        @for (post of posts(); track post.id) {
          <a class="post card-surface" [routerLink]="['/blog', post.slug]">
            <div class="post-meta muted">
              @if (post.publishedAt) { {{ post.publishedAt | date: 'mediumDate' }} }
              @for (t of post.tags; track t) { <span class="tag">{{ t }}</span> }
            </div>
            <h2>{{ post.title }}</h2>
            <p class="muted">{{ post.excerpt }}</p>
            <span class="read">Read more →</span>
          </a>
        } @empty {
          <p class="muted">No posts yet — check back soon.</p>
        }
      </div>
    </section>
  `,
  styles: `
    h1 { font-size: 2.2rem; margin-bottom: 0.25rem; }
    .list { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
    .post { display: block; padding: 1.5rem; color: var(--pw-text); transition: border-color .15s ease; }
    .post:hover { text-decoration: none; border-color: var(--pw-accent); }
    .post h2 { margin: 0.4rem 0; font-size: 1.4rem; }
    .post-meta { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; flex-wrap: wrap; }
    .tag { padding: 0.15rem 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--pw-accent) 14%, transparent); color: var(--pw-accent); }
    .read { color: var(--pw-accent); font-weight: 500; font-size: 0.9rem; }
  `,
})
export default class Blog {
  private readonly api = inject(ApiService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly posts = signal<BlogPostSummary[]>([]);

  constructor() {
    if (this.isBrowser) this.api.getPosts().subscribe((p) => this.posts.set(p));
  }
}
