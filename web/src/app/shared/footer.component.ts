import { Component } from '@angular/core';
import { SITE_NAME, SOCIAL_LINKS } from '../core/config';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="ftr">
      <div class="container ftr-inner">
        <span class="muted">© {{ year }} {{ siteName }} · Built with Angular & .NET</span>
        <div class="socials">
          @if (social.github) {
            <a [href]="social.github" target="_blank" rel="noreferrer" aria-label="GitHub">GitHub</a>
          }
          @if (social.linkedin) {
            <a [href]="social.linkedin" target="_blank" rel="noreferrer" aria-label="LinkedIn">LinkedIn</a>
          }
          @if (social.instagram) {
            <a [href]="social.instagram" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>
          }
          @if (social.email) {
            <a [href]="'mailto:' + social.email" aria-label="Email">Email</a>
          }
        </div>
      </div>
    </footer>
  `,
  styles: `
    .ftr {
      border-top: 1px solid var(--pw-border);
      margin-top: 3rem;
      padding: 2rem 0;
    }
    .ftr-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.9rem;
    }
    .socials { display: flex; gap: 1.2rem; }
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly siteName = SITE_NAME;
  readonly social = SOCIAL_LINKS;
}
