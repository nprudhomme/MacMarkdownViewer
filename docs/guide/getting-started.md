# Getting Started

## Download

Download the latest `.dmg` from the [Releases](https://github.com/nprudhomme/MacMarkdownViewer/releases) page.

::: warning Gatekeeper
The app is not signed with an Apple Developer certificate. After installing, macOS Gatekeeper may block it. To fix this, run:

```bash
xattr -cr "/Applications/Markdown Viewer.app"
```
:::

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

## Examples

The app includes a built-in **View examples** button on the welcome screen that loads sample documents showcasing all supported features. These examples cover code highlighting, math, diagrams, alerts, footnotes, tables, and more.
