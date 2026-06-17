import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section class="container section narrow">
      <div class="card-surface box">
        <h1>Admin sign in</h1>
        <p class="muted">Manage projects, posts and messages.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="username" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
          </mat-form-field>
          @if (error()) { <p class="err">{{ error() }}</p> }
          <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
            <mat-icon>login</mat-icon> {{ submitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </section>
  `,
  styles: `
    .narrow { max-width: 420px; }
    .box { padding: 2rem; }
    h1 { font-size: 1.6rem; margin: 0 0 0.25rem; }
    form { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem; }
    mat-form-field { width: 100%; }
    button { margin-top: 0.5rem; }
    button mat-icon { margin-right: 4px; }
    .err { color: #dc2626; }
  `,
})
export default class AdminLogin {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => {
        this.error.set('Invalid credentials.');
        this.submitting.set(false);
      },
    });
  }
}
