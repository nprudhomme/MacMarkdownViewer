export interface Entry {
  name: string;
  kind: "directory" | "file";
}

/**
 * Resolve a relative path against a base directory path.
 * Handles `..`, `.`, and empty segments.
 */
export function resolvePath(base: string[], relative: string): string {
  const parts = [...base];
  for (const segment of relative.split("/")) {
    if (segment === "..") parts.pop();
    else if (segment !== "." && segment !== "") parts.push(segment);
  }
  return parts.join("/");
}

/**
 * Build a full filesystem path from a root and path segments.
 */
export function getFullPath(
  rootPath: string,
  pathParts: string[]
): string {
  if (pathParts.length === 0) return rootPath;
  return `${rootPath}/${pathParts.join("/")}`;
}

/**
 * Extract the folder name from an absolute path.
 */
export function extractRootName(path: string): string {
  return path.split("/").pop() || "root";
}

/**
 * Filter and sort raw directory entries into sorted dirs-first entries.
 * Only includes directories and .md files, excludes dotfiles.
 */
export function filterAndSortEntries(
  rawEntries: { name: string | undefined; isDirectory: boolean }[]
): Entry[] {
  const dirs: Entry[] = [];
  const files: Entry[] = [];

  for (const entry of rawEntries) {
    if (!entry.name || entry.name.startsWith(".")) continue;
    if (entry.isDirectory) {
      dirs.push({ name: entry.name, kind: "directory" });
    } else if (entry.name.endsWith(".md")) {
      files.push({ name: entry.name, kind: "file" });
    }
  }

  dirs.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));
  return [...dirs, ...files];
}

/**
 * Classify a link href for handling.
 */
export function classifyLink(
  href: string
): "external" | "anchor" | "markdown" | "other" {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return "external";
  }
  if (href.startsWith("#")) {
    return "anchor";
  }
  if (href.endsWith(".md") || href.includes(".md#")) {
    return "markdown";
  }
  return "other";
}

/**
 * Parse a markdown link href into file part and optional anchor.
 */
export function parseMarkdownHref(
  href: string
): { filePart: string; anchor: string | undefined } {
  const [filePart, anchor] = href.split("#");
  return { filePart, anchor };
}

/**
 * Find a README.md entry (case-insensitive) in a list of entries.
 */
export function findReadme(entries: Entry[]): Entry | undefined {
  return entries.find(
    (e) => e.kind === "file" && e.name.toLowerCase() === "readme.md"
  );
}

/** What the Rust `get_pending_open` command buffered for this window. */
export type PendingOpen =
  | { kind: "file"; path: string }
  | { kind: "folder"; path: string }
  | { kind: "empty" };

/** What a window should display right after init. */
export type InitialView =
  | { kind: "file"; path: string }
  | { kind: "folder"; path: string; file?: string }
  | { kind: "welcome" };

/**
 * True when `file` sits inside `folder` (as a direct or nested child).
 * Guards against a stale/corrupted store where `lastFile` no longer matches
 * `lastFolder` — e.g. edited by hand, or left over from an older version.
 */
function isWithinFolder(folder: string, file: string): boolean {
  return file.startsWith(`${folder}/`);
}

/**
 * Decide what a window shows on startup.
 *
 * A pending open (CLI arg, Finder "Open With", or a folder handed to a freshly
 * spawned window) always wins over the persisted folder, so the user never sees
 * a flash of the previous folder. `kind: "empty"` is the marker for a window
 * spawned by "New Window": it must land on the welcome screen rather than
 * restoring `lastFolder`, otherwise it would just clone the window it came from.
 *
 * When a folder is restored, `savedFile` (if it's actually inside that folder)
 * is returned as a path relative to it, ready for `setRootPath`'s `fileToOpen`
 * — that reopens the exact document instead of falling back to the folder's
 * README.
 */
export function resolveInitialView(
  pending: PendingOpen | null,
  savedFolder: string | null,
  savedFile: string | null
): InitialView {
  if (pending) {
    if (pending.kind === "file") return { kind: "file", path: pending.path };
    if (pending.kind === "folder") return { kind: "folder", path: pending.path };
    return { kind: "welcome" };
  }
  if (savedFolder) {
    if (savedFile && isWithinFolder(savedFolder, savedFile)) {
      return {
        kind: "folder",
        path: savedFolder,
        file: savedFile.slice(savedFolder.length + 1),
      };
    }
    return { kind: "folder", path: savedFolder };
  }
  return { kind: "welcome" };
}

export const DEFAULT_WINDOW_TITLE = "Markdown Viewer";

/**
 * Native title for a window, used by the macOS Window menu to label the entry
 * it adds per window (the title itself stays hidden in the custom title bar).
 *
 * Most specific thing first: the open document, else the folder being browsed,
 * else the app name for a window still on the welcome screen.
 */
export function windowTitle(
  activeFile: string | null,
  rootName: string
): string {
  const fileName = activeFile?.split("/").pop();
  if (fileName) return fileName;
  if (rootName) return rootName;
  return DEFAULT_WINDOW_TITLE;
}

export type RecentEntry = { path: string; kind: "file" | "folder" };

/**
 * Prepend an entry to the recents list, dropping any prior entry with the same
 * path (most-recent-wins) and capping the list length.
 */
export function mergeRecent(
  list: RecentEntry[],
  entry: RecentEntry,
  max: number
): RecentEntry[] {
  return [entry, ...list.filter((e) => e.path !== entry.path)].slice(0, max);
}
