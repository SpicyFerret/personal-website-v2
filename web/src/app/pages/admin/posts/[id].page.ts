import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouteMeta } from '@analogjs/router';
import { QuillEditorComponent } from 'ngx-quill';
import { ApiService } from '../../../core/api.service';
import { SaveBlogPost } from '../../../core/models';
import { authGuard } from '../../../core/auth.guard';
import { QUILL_MODULES, registerQuillExtensions } from '../../../shared/quill-config';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-admin-post-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    QuillEditorComponent,
  ],
  template: `
    <section class="container section narrow">
      <a routerLink="/admin/posts" class="muted">← Posts</a>
      <h1>{{ isNew ? 'New post' : 'Edit post' }}</h1>

      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Slug (optional — auto from title)</mat-label>
          <input matInput formControlName="slug" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Excerpt</mat-label>
          <textarea matInput rows="2" formControlName="excerpt"></textarea>
        </mat-form-field>

        <div class="cover">
          <mat-form-field appearance="outline" class="grow">
            <mat-label>Cover image URL</mat-label>
            <input matInput formControlName="coverImageUrl" />
          </mat-form-field>
          <button mat-stroked-button type="button" (click)="file.click()" [disabled]="uploading()">
            <mat-icon>upload</mat-icon> {{ uploading() ? 'Uploading…' : 'Upload' }}
          </button>
          <input #file type="file" hidden accept="image/*" (change)="upload($event)" />
        </div>

        <label class="field-label">Content</label>
        <quill-editor
          formControlName="content"
          [modules]="quillModules"
          placeholder="Write your post…"
        ></quill-editor>

        <mat-form-field appearance="outline">
          <mat-label>Tags (comma separated)</mat-label>
          <input matInput formControlName="tags" />
        </mat-form-field>

        <mat-slide-toggle formControlName="isPublished">Published</mat-slide-toggle>

        @if (error()) { <p class="err">{{ error() }}</p> }

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
            <mat-icon>save</mat-icon> {{ saving() ? 'Saving…' : 'Save' }}
          </button>
          <a mat-button routerLink="/admin/posts">Cancel</a>
        </div>
      </form>
    </section>
  `,
  styles: `
    .narrow { max-width: 760px; }
    h1 { font-size: 1.8rem; margin: 0.25rem 0 1.5rem; }
    form { display: flex; flex-direction: column; gap: 0.4rem; }
    mat-form-field { width: 100%; }
    .cover { display: flex; gap: 0.5rem; align-items: flex-start; }
    .cover .grow { flex: 1 1 auto; }
    .actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; }
    .actions mat-icon, .cover mat-icon { margin-right: 4px; }
    .err { color: #dc2626; }
    mat-slide-toggle { margin: 0.5rem 0; }
    .field-label { font-size: 0.85rem; color: var(--pw-muted); margin: 0.5rem 0 0.25rem; }
    quill-editor { display: block; margin-bottom: 1rem; }
  `,
})
export default class AdminPostEdit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = this.route.snapshot.paramMap.get('id')!;
  readonly isNew = this.id === 'new';
  readonly quillModules = QUILL_MODULES;

  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: [''],
    excerpt: [''],
    coverImageUrl: [''],
    content: [''],
    tags: [''],
    isPublished: [false],
  });

  constructor() {
    registerQuillExtensions();
    if (!this.isNew) {
      this.api.getPostById(this.id).subscribe((p) =>
        this.form.patchValue({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          coverImageUrl: p.coverImageUrl ?? '',
          content: p.content,
          tags: p.tags.join(', '),
          isPublished: p.isPublished,
        }),
      );
    }
  }

  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadAsset(file, 'blog').subscribe({
      next: (res) => {
        this.form.patchValue({ coverImageUrl: res.url });
        this.uploading.set(false);
      },
      error: () => {
        this.error.set('Upload failed (is R2 configured?).');
        this.uploading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    const body: SaveBlogPost = {
      title: v.title,
      slug: v.slug || null,
      excerpt: v.excerpt,
      coverImageUrl: v.coverImageUrl || null,
      content: v.content,
      isPublished: v.isPublished,
      tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    const req = this.isNew
      ? this.api.createPost(body)
      : this.api.updatePost(this.id, body);
    req.subscribe({
      next: () => this.router.navigate(['/admin/posts']),
      error: () => {
        this.error.set('Save failed.');
        this.saving.set(false);
      },
    });
  }
}
