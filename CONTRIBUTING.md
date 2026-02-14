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
├── index.html                # App HTML + CSS
├── src/
│   └── main.ts               # Frontend logic (TypeScript)
├── src-tauri/
│   ├── src/
│   │   ├── main.rs            # CLI argument parsing
│   │   └── lib.rs             # Tauri setup, plugins, native menu
│   ├── tauri.conf.json        # App configuration
│   └── capabilities/
│       └── default.json       # Permission scopes
├── vite.config.ts             # Vite configuration
└── tsconfig.json              # TypeScript configuration
```

### Commands

| Command | Description |
|---|---|
| `npm run tauri dev` | Run in development mode with HMR |
| `npm run tauri build` | Build production `.app` and `.dmg` |
| `npm run dev` | Run Vite dev server only (no Tauri) |
| `npm run build` | Build frontend only |

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/my-change`
2. Make your changes
3. Test locally with `npm run tauri dev`
4. Commit with a clear message describing the change
5. Push and open a Pull Request

## Reporting Issues

Please open an [issue](https://github.com/nprudhomme/MacMarkdownViewer/issues) with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- macOS version and app version
