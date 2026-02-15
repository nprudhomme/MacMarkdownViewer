# Contributing

Thanks for your interest in contributing to MacMarkdownViewer!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone git@github.com:YOUR_USERNAME/MacMarkdownViewer.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run tauri dev`

## Development

### Prerequisites

- Node.js >= 18
- Rust stable (install via [rustup](https://rustup.rs/))
- macOS with Xcode Command Line Tools

### Project Structure

```
├── index.html                  # App HTML + CSS
├── src/
│   ├── main.ts                 # App logic (UI, file browsing, theme)
│   ├── markdown.ts             # Markdown parsing + sanitization pipeline
│   ├── dom.ts                  # DOM post-processing (copy buttons, lightbox)
│   ├── utils.ts                # Utility functions (path resolution, etc.)
│   ├── markdown.test.ts        # Markdown pipeline tests
│   ├── integration.test.ts     # Integration tests (DOM rendering)
│   └── utils.test.ts           # Utility function tests
├── src-tauri/
│   ├── src/
│   │   ├── main.rs             # CLI argument parsing
│   │   └── lib.rs              # Tauri setup, plugins, native menu
│   ├── tauri.conf.json         # App configuration
│   └── capabilities/
│       └── default.json        # Permission scopes
├── docs/                       # VitePress documentation
├── vite.config.ts              # Vite + Vitest configuration
└── tsconfig.json               # TypeScript configuration
```

### Commands

| Command | Description |
|---|---|
| `npm run tauri dev` | Run in development mode with HMR |
| `npm run tauri build` | Build production `.app` and `.dmg` |
| `npm run dev` | Run Vite dev server only (no Tauri) |
| `npm run build` | Build frontend only |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run docs:dev` | Run documentation dev server |
| `npm run docs:build` | Build documentation site |

## Testing

The project uses [Vitest](https://vitest.dev/) with jsdom for testing. Tests cover:

- **Utility functions** — Path resolution, entry filtering, link classification
- **Markdown pipeline** — Parsing, extensions, sanitization
- **Integration** — DOM rendering, copy buttons, lightbox

Run all tests:

```bash
npm test
```

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/my-change`
2. Make your changes
3. Run tests: `npm test`
4. Type check: `npx tsc --noEmit`
5. Commit with a clear message describing the change
6. Push and open a Pull Request

## Reporting Issues

Please open an [issue](https://github.com/nprudhomme/MacMarkdownViewer/issues) with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- macOS version and app version
