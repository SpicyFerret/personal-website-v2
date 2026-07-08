/** Shared Quill toolbar/modules + custom formats for all admin rich-text editors. */
export const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      ['grad'], // custom: the site's two-color gradient text (span.grad)
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
    handlers: {
      grad(this: { quill: { getFormat(): Record<string, unknown>; format(k: string, v: unknown): void } }) {
        const active = !!this.quill.getFormat()['grad'];
        this.quill.format('grad', !active);
      },
    },
  },
};

let registered = false;

/**
 * Registers the custom `grad` inline format (renders as <span class="grad">,
 * the same gradient used by the home title). Call from the admin pages'
 * constructors — idempotent and browser-only.
 */
export function registerQuillExtensions(): void {
  if (registered || typeof window === 'undefined') return;
  registered = true;
  import('quill').then(({ default: Quill }) => {
    const Inline = Quill.import('blots/inline') as { new (...args: unknown[]): object };
    class GradBlot extends Inline {
      static blotName = 'grad';
      static tagName = 'SPAN';
      static className = 'grad';
    }
    Quill.register('formats/grad', GradBlot as never, true);
  });
}
