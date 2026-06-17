import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../core/api.service';
import { SOCIAL_LINKS } from '../core/config';

@Component({
  selector: 'app-contact',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <section class="container section narrow">
      <h1>Get in touch</h1>
      <p class="muted">
        Have an opportunity or just want to say hi? Drop me a message — or reach me on
        <a [href]="social.linkedin" target="_blank" rel="noreferrer">LinkedIn</a>.
      </p>

      @if (sent()) {
        <div class="success card-surface">
          <mat-icon>check_circle</mat-icon>
          <p>{{ successMessage() }}</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" />
            @if (form.controls.name.invalid && form.controls.name.touched) {
              <mat-error>Name is required.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <mat-error>A valid email is required.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Subject (optional)</mat-label>
            <input matInput formControlName="subject" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Message</mat-label>
            <textarea matInput rows="6" formControlName="message"></textarea>
            @if (form.controls.message.invalid && form.controls.message.touched) {
              <mat-error>Please write a message.</mat-error>
            }
          </mat-form-field>

          @if (error()) { <p class="err">{{ error() }}</p> }

          <button mat-flat-button color="primary" type="submit" [disabled]="submitting()">
            <mat-icon>send</mat-icon> {{ submitting() ? 'Sending…' : 'Send message' }}
          </button>
        </form>
      }
    </section>
  `,
  styles: `
    .narrow { max-width: 640px; }
    h1 { font-size: 2.2rem; margin-bottom: 0.25rem; }
    .form { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem; }
    .form button { align-self: flex-start; }
    .form mat-icon { margin-right: 4px; }
    .success { display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem; margin-top: 1.5rem; }
    .success mat-icon { color: #16a34a; }
    .err { color: #dc2626; }
  `,
})
export default class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly social = SOCIAL_LINKS;

  readonly submitting = signal(false);
  readonly sent = signal(false);
  readonly successMessage = signal('');
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    message: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.api.submitContact(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.sent.set(true);
      },
      error: () => {
        this.error.set('Something went wrong. Please try again or email me directly.');
        this.submitting.set(false);
      },
    });
  }
}
