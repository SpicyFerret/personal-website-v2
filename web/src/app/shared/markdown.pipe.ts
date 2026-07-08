import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Renders long-form content to sanitized HTML.
 * Accepts BOTH formats we have in the database:
 *  - rich text (HTML from the Quill editor) → sanitized as-is
 *  - legacy markdown → parsed with marked, then sanitized
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    const trimmed = value.trimStart();
    const html = trimmed.startsWith('<')
      ? value
      : (marked.parse(value, { async: false }) as string);
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
