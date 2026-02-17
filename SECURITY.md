# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

Only the latest release receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it through [GitHub Security Advisories](https://github.com/nprudhomme/MacMarkdownViewer/security/advisories/new).

**Please do not open a public issue for security vulnerabilities.**

You can expect an initial response within 72 hours. Once confirmed, a fix will be prioritized and released as soon as possible.

## Security Measures

This project takes security seriously:

- All rendered HTML is sanitized through [DOMPurify](https://github.com/cure53/DOMPurify) to prevent XSS attacks
- Script tags, event handlers, JavaScript URIs, and iframes are stripped
- Safe content (KaTeX, MathML, checkboxes) is preserved through a configured allowlist
