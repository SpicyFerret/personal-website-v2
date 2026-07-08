import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Renders long-form content to sanitized HTML.
 * Accepts BOTH formats we have in the database:
 *  - rich text (HTML from the Quill editor) → sanitized as-is
 *  - legacy markdown → parsed with marked, then sanitized
 *
 * Sanitization: DOMPurify in the browser (keeps inline `style` — Quill stores
 * text/background colors that way — while stripping scripts/handlers). During
 * SSR we fall back to Angular's sanitizer (drops styles; harmless since these
 * pages hydrate and re-render client-side).
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    const trimmed = value.trimStart();
    let html = trimmed.startsWith('<')
      ? value
      : (marked.parse(value, { async: false }) as string);

    // Quill turns pasted spaces into &nbsp;, which never line-wraps — long
    // sentences overflow instead of breaking. Normal spaces are what we want.
    html = html.replace(/&nbsp;/g, ' ').replace(/ /g, ' ');

    if (this.isBrowser) {
      const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
      return this.sanitizer.bypassSecurityTrustHtml(clean);
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
