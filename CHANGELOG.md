# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.5.1](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.5.1) - 2026-02-16

### Fixed

- Replace fixed 500px max-height for Mermaid diagrams with dynamic sizing that fits SVG content (capped at 80vh)

## [0.5.0](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.5.0) - 2026-02-15

### Added

- Marked plugins: alerts, footnotes, smartypants, extended tables, emoji
- Copy button on code blocks with clipboard feedback
- Image lightbox with Esc/click-outside to close
- Task list checkboxes for GFM support
- Built-in example files with "View examples" button on home screen

### Security

- Sanitize markdown HTML output with DOMPurify to prevent XSS

## [0.4.1](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.4.1) - 2026-02-14

### Fixed

- Make notarization non-blocking with 15-minute timeout to handle Apple service delays

## [0.4.0](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.4.0) - 2026-02-14

### Added

- Apple notarization with `--wait` and stapler staple
- DMG now includes /Applications symlink for drag-and-drop install

## [0.3.0](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.3.0) - 2026-02-14

### Fixed

- Re-sign app with hardened runtime and timestamp for proper code signing
- Include entitlements.plist for WebKit compatibility

## [0.2.0](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.2.0) - 2026-02-14

### Changed

- Publish signed DMG immediately, notarize as non-blocking background step

## [0.1.0](https://github.com/nprudhomme/MacMarkdownViewer/releases/tag/v0.1.0) - 2026-02-14

### Added

- Initial release: native macOS Markdown viewer built with Tauri v2
- Folder browsing with directory tree sidebar
- Markdown rendering with syntax highlighting (highlight.js)
- KaTeX math support (inline and display)
- Mermaid diagram rendering
- Outline panel with scroll tracking
- Dark mode following macOS system appearance
- Session persistence (remembers last opened folder)
- CLI support: `mdv ~/docs`
- Native macOS menu with Cmd+O
- CI/CD workflows with GitHub Actions
