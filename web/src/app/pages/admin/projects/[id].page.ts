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
import { SaveProject } from '../../../core/models';
import { authGuard } from '../../../core/auth.guard';
import { QUILL_MODULES } from '../../../shared/quill-config';

export const routeMeta: RouteMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-admin-project-edit',
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
      <a routerLink="/admin/projects" class="muted">← Projects</a>
      <h1>{{ isNew ? 'New project' : 'Edit project' }}</h1>

      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Slug (optional)</mat-label>
          <input matInput formControlName="slug" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Summary</mat-label>
          <textarea matInput rows="2" formControlName="summary"></textarea>
        </mat-form-field>

        <label class="field-label">Description</label>
        <quill-editor
          formControlName="description"
          [modules]="quillModules"
          placeholder="Describe the project…"
        ></quill-editor>

        <div class="two">
          <mat-form-field appearance="outline">
            <mat-label>Repository URL</mat-label>
            <input matInput formControlName="repoUrl" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Live URL</mat-label>
            <input matInput formControlName="liveUrl" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Tech stack (comma separated)</mat-label>
          <input matInput formControlName="techStack" />
        </mat-form-field>

        <div class="two">
          <mat-form-field appearance="outline">
            <mat-label>Sort order</mat-label>
            <input matInput type="number" formControlName="sortOrder" />
          </mat-form-field>
          <mat-slide-toggle formControlName="isFeatured">Featured</mat-slide-toggle>
        </div>

        @if (error()) { <p class="err">{{ error() }}</p> }

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="saving()">
            <mat-icon>save</mat-icon> {{ saving() ? 'Saving…' : 'Save' }}
          </button>
          <a mat-button routerLink="/admin/projects">Cancel</a>
        </div>
      </form>
    </section>
  `,
  styles: `
    .narrow { max-width: 760px; }
    h1 { font-size: 1.8rem; margin: 0.25rem 0 1.5rem; }
    form { display: flex; flex-direction: column; gap: 0.4rem; }
    mat-form-field { width: 100%; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; align-items: center; }
    @media (max-width: 600px) { .two { grid-template-columns: 1fr; } }
    .actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; }
    .actions mat-icon { margin-right: 4px; }
    .err { color: #dc2626; }
    .field-label { font-size: 0.85rem; color: var(--pw-muted); margin: 0.5rem 0 0.25rem; }
    quill-editor { display: block; margin-bottom: 1rem; }
  `,
})
export default class AdminProjectEdit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly id = this.route.snapshot.paramMap.get('id')!;
  readonly isNew = this.id === 'new';
  readonly quillModules = QUILL_MODULES;

  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: [''],
    summary: [''],
    description: [''],
    repoUrl: [''],
    liveUrl: [''],
    techStack: [''],
    sortOrder: [0],
    isFeatured: [false],
  });

  constructor() {
    if (!this.isNew) {
      this.api.getProjectById(this.id).subscribe((p) =>
        this.form.patchValue({
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          description: p.description,
          repoUrl: p.repoUrl ?? '',
          liveUrl: p.liveUrl ?? '',
          techStack: p.techStack.join(', '),
          sortOrder: p.sortOrder,
          isFeatured: p.isFeatured,
        }),
      );
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    const body: SaveProject = {
      title: v.title,
      slug: v.slug || null,
      summary: v.summary,
      description: v.description,
      repoUrl: v.repoUrl || null,
      liveUrl: v.liveUrl || null,
      techStack: v.techStack.split(',').map((t) => t.trim()).filter(Boolean),
      sortOrder: Number(v.sortOrder) || 0,
      isFeatured: v.isFeatured,
    };
    const req = this.isNew
      ? this.api.createProject(body)
      : this.api.updateProject(this.id, body);
    req.subscribe({
      next: () => this.router.navigate(['/admin/projects']),
      error: () => {
        this.error.set('Save failed.');
        this.saving.set(false);
      },
    });
  }
}
