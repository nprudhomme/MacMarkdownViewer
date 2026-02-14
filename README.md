# MacMarkdownViewer

A native macOS Markdown viewer built with [Tauri v2](https://v2.tauri.app/). Browse folders, read `.md` files with a clean rendered view, navigate between documents, and enjoy a native experience with dark mode support.

## Features

- **Folder browsing** — Open any folder and navigate its directory tree via the sidebar
- **Markdown rendering** — GitHub-flavored Markdown with headings, tables, code blocks, blockquotes, and more
- **Outline panel** — Auto-generated table of contents (h2/h3) with scroll tracking
- **Relative link navigation** — Click `.md` links to navigate between documents
- **Dark mode** — Follows macOS system appearance automatically
- **Session persistence** — Remembers your last opened folder across launches
- **CLI support** — Open a folder directly: `mdv ~/docs`
- **Native menu** — Cmd+O to open a folder, standard macOS app menu

## Download

Download the latest `.dmg` from the [Releases](https://github.com/nprudhomme/MacMarkdownViewer/releases) page.

## Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (stable)
- macOS with Xcode Command Line Tools

### Steps

```bash
# Clone the repo
git clone git@github.com:nprudhomme/MacMarkdownViewer.git
cd MacMarkdownViewer

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production (.app + .dmg)
npm run tauri build
```

The built app will be at `src-tauri/target/release/bundle/macos/Markdown Viewer.app`.

## Usage

### GUI

1. Launch the app
2. Click **Open folder** or press **Cmd+O**
3. Select a folder containing `.md` files
4. Browse and read your documentation

### CLI

```bash
# Open a specific folder
./src-tauri/target/release/mdv ~/my-docs

# Or after installing the .app
/Applications/Markdown\ Viewer.app/Contents/MacOS/mdv ~/my-docs
```

## Tech Stack

- **[Tauri v2](https://v2.tauri.app/)** — Native app shell with Rust backend
- **[Vite](https://vite.dev/)** — Frontend build tool
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe frontend logic
- **[marked](https://marked.js.org/)** — Markdown parser
- **Tauri plugins** — `fs` (file access), `dialog` (folder picker), `store` (persistence)

## License

[MIT](LICENSE)
