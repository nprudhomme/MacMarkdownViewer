# Security

## Overview

Markdown Viewer renders user-provided Markdown files as HTML. Since Markdown can contain raw HTML, the app takes security seriously to prevent cross-site scripting (XSS) and other injection attacks.

## DOMPurify Sanitization

All rendered HTML passes through [DOMPurify](https://github.com/cure53/DOMPurify) before being injected into the DOM. This is the industry-standard HTML sanitization library.

### What is blocked

| Attack Vector | Example | Result |
|---|---|---|
| Script injection | `<script>alert(1)</script>` | Tag stripped entirely |
| Event handlers | `<img onerror="alert(1)">` | Attribute removed, `<img>` kept |
| JavaScript URIs | `<a href="javascript:alert(1)">` | `href` removed |
| Iframe injection | `<iframe src="evil.com">` | Tag stripped entirely |
| SVG event handlers | `<svg onload="alert(1)">` | Attribute removed |
| Details toggle handler | `<details ontoggle="alert(1)">` | Attribute removed |

### What is preserved

The sanitization configuration includes an allowlist for legitimate content:

- **KaTeX output** — `style` attributes on math elements
- **MathML** — `<math>`, `<semantics>`, `<mrow>`, and other MathML tags
- **Checkboxes** — `<input type="checkbox" checked disabled>` for task lists
- **Footnote attributes** — `data-footnote-ref`, `data-footnote-backref`
- **ARIA attributes** — `aria-hidden` for accessibility

## Tauri Sandboxing

The app runs inside Tauri's security sandbox:

- **File access** — Scoped to user-selected directories only
- **No network access** — The app does not make any network requests
- **No shell access** — The app cannot execute system commands
- **Capability-based permissions** — Only the required Tauri plugins are enabled (`fs`, `dialog`, `store`)

## External Links

All external links (`http://`, `https://`) are opened in the user's default browser with `target="_blank"` and `rel="noopener"` to prevent reverse tabnapping.
