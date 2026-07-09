interface QuillDeltaOp {
  attributes?: Record<string, unknown>;
}
interface QuillDelta {
  ops?: QuillDeltaOp[];
}

/**
 * Strips color/background carried over when pasting from an external source
 * (chat bubbles, Word, web pages usually embed their own theme colors in the
 * clipboard HTML). Runs only on paste — colors applied from the toolbar
 * inside the editor are untouched.
 */
function stripPastedColors(_node: unknown, delta: QuillDelta): QuillDelta {
  delta.ops?.forEach((op) => {
    if (op.attributes) {
      delete op.attributes['color'];
      delete op.attributes['background'];
    }
  });
  return delta;
}

type QuillHandlerCtx = {
  quill: { getFormat(): Record<string, unknown>; format(name: string, value: unknown): void };
};

/** Shared Quill toolbar/modules + custom formats for all admin rich-text editors. */
export const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }, 'clear-color', 'clear-bg'],
      ['grad'], // custom: the site's two-color gradient text (span.grad)
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
    handlers: {
      grad(this: QuillHandlerCtx) {
        const active = !!this.quill.getFormat()['grad'];
        this.quill.format('grad', !active);
      },
      // Remove ONLY the text/background color from the selection — unlike
      // the built-in 'clean' button, which strips every format at once.
      'clear-color'(this: QuillHandlerCtx) {
        this.quill.format('color', false);
      },
      'clear-bg'(this: QuillHandlerCtx) {
        this.quill.format('background', false);
      },
    },
  },
  clipboard: {
    // 1 = Node.ELEMENT_NODE — match every pasted element.
    matchers: [[1, stripPastedColors]],
  },
};

let registered = false;

const CUSTOM_BUTTON_TITLES: Record<string, string> = {
  'ql-clear-color': 'Remove text color',
  'ql-clear-bg': 'Remove background color',
  'ql-grad': 'Gradient text',
};

/** Sets a native tooltip on our custom toolbar buttons (Quill doesn't do this for handler-only entries). */
function labelCustomButtons(root: ParentNode): void {
  for (const [cls, title] of Object.entries(CUSTOM_BUTTON_TITLES)) {
    root.querySelectorAll<HTMLButtonElement>(`.${cls}`).forEach((btn) => {
      if (!btn.title) btn.title = title;
    });
  }
}

/**
 * Registers the custom `grad` inline format (renders as <span class="grad">,
 * the same gradient used by the home title) and tooltips for the custom
 * toolbar buttons. Call from the admin pages' constructors — idempotent and
 * browser-only.
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

  // Toolbars are created asynchronously (and there can be several — the Site
  // content page renders one per key) — watch the DOM instead of one-shotting.
  new MutationObserver(() => labelCustomButtons(document)).observe(document.body, {
    childList: true,
    subtree: true,
  });
}
