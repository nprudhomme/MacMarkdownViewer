import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  resolvePath,
  getFullPath,
  extractRootName,
  filterAndSortEntries,
  classifyLink,
  parseMarkdownHref,
  findReadme,
} from "./utils";
import type { Entry } from "./utils";

const marked = new Marked();
marked.use(gfmHeadingId());

const fileList = document.getElementById("file-list") as HTMLDivElement;
const breadcrumb = document.getElementById("breadcrumb") as HTMLDivElement;
const markdownEl = document.getElementById("markdown") as HTMLDivElement;
const emptyState = document.getElementById("empty-state") as HTMLDivElement;
const contentEl = document.getElementById("content") as HTMLDivElement;
const openBtn = document.getElementById("open-btn") as HTMLButtonElement;
const outlineEl = document.getElementById("outline") as HTMLDivElement;
const outlineNav = document.getElementById("outline-nav") as HTMLElement;

let rootPath: string | null = null;
let rootName = "";
let currentPath: string[] = [];
let activeFile: string | null = null;
let scrollObserver: IntersectionObserver | null = null;

const STORE_FILE = "settings.json";
const STORE_KEY = "lastFolder";

// --- Store persistence ---

async function saveRootPath(path: string): Promise<void> {
  const store = await load(STORE_FILE);
  await store.set(STORE_KEY, path);
  await store.save();
}

async function loadRootPath(): Promise<string | null> {
  const store = await load(STORE_FILE);
  return ((await store.get(STORE_KEY)) as string) ?? null;
}

// --- Init ---

openBtn.addEventListener("click", openFolder);

async function init(): Promise<void> {
  const appWindow = getCurrentWindow();

  // Listen for CLI argument passed via Tauri event
  appWindow.listen<string>("open-folder", (event) => {
    setRootPath(event.payload);
  });

  // Listen for menu "Open Folder" (Cmd+O)
  appWindow.listen("menu-open-folder", () => {
    openFolder();
  });

  // Try restoring last folder
  const saved = await loadRootPath();
  if (saved) {
    await setRootPath(saved);
  }
}

async function setRootPath(path: string): Promise<void> {
  rootPath = path;
  rootName = extractRootName(path);
  currentPath = [];
  activeFile = null;
  await saveRootPath(path);
  await renderSidebar();
  await autoSelectReadme();
}

async function openFolder(): Promise<void> {
  const selected = await open({ directory: true, multiple: false });
  if (selected) {
    await setRootPath(selected);
  }
}

// --- Filesystem ---

async function listEntries(dirPath: string): Promise<Entry[]> {
  const entries = await readDir(dirPath);
  return filterAndSortEntries(entries);
}

// --- Sidebar ---

async function renderSidebar(): Promise<void> {
  const dirPath = getFullPath(rootPath!, currentPath);
  const entries = await listEntries(dirPath);
  fileList.innerHTML = "";

  emptyState.style.display = "none";
  markdownEl.style.display = activeFile ? "block" : "none";
  if (!activeFile) {
    emptyState.style.display = "block";
    contentEl.classList.add("empty");
  }

  if (currentPath.length > 0) {
    const back = document.createElement("div");
    back.className = "file-item";
    back.innerHTML =
      '<span class="icon">..</span><span class="name">Parent directory</span>';
    back.addEventListener("click", () => {
      currentPath.pop();
      renderSidebar();
    });
    fileList.appendChild(back);
  }

  for (const entry of entries) {
    const item = document.createElement("div");
    item.className = "file-item";
    const icon = entry.kind === "directory" ? "\u{1F4C1}" : "\u{1F4C4}";
    item.innerHTML = `<span class="icon">${icon}</span><span class="name">${entry.name}</span>`;

    if (entry.kind === "directory") {
      item.addEventListener("click", () => {
        currentPath.push(entry.name);
        renderSidebar();
      });
    } else {
      const filePath = [...currentPath, entry.name].join("/");
      if (filePath === activeFile) item.classList.add("active");
      item.addEventListener("click", () => loadFile(filePath));
    }
    fileList.appendChild(item);
  }
  renderBreadcrumb();
}

function renderBreadcrumb(): void {
  breadcrumb.innerHTML = "";

  const changeBtn = document.createElement("span");
  changeBtn.textContent = "\u21C4";
  changeBtn.title = "Change folder";
  changeBtn.style.cssText =
    "cursor:pointer;font-size:14px;margin-right:4px;opacity:0.6;";
  changeBtn.addEventListener("click", openFolder);
  breadcrumb.appendChild(changeBtn);

  const root = document.createElement("span");
  root.textContent = rootName;
  if (currentPath.length > 0) {
    root.addEventListener("click", () => {
      currentPath = [];
      renderSidebar();
    });
  } else {
    root.classList.add("current");
  }
  breadcrumb.appendChild(root);

  currentPath.forEach((part, i) => {
    breadcrumb.appendChild(document.createTextNode(" / "));
    const span = document.createElement("span");
    span.textContent = part;
    if (i < currentPath.length - 1) {
      span.addEventListener("click", () => {
        currentPath = currentPath.slice(0, i + 1);
        renderSidebar();
      });
    } else {
      span.classList.add("current");
    }
    breadcrumb.appendChild(span);
  });
}

// --- File loading ---

async function autoSelectReadme(): Promise<void> {
  const dirPath = getFullPath(rootPath!, currentPath);
  const entries = await listEntries(dirPath);
  const readme = findReadme(entries);
  if (readme) await loadFile([...currentPath, readme.name].join("/"));
}

async function loadFile(filePath: string): Promise<void> {
  try {
    const fullPath = `${rootPath}/${filePath}`;
    const text = await readTextFile(fullPath);

    activeFile = filePath;
    emptyState.style.display = "none";
    markdownEl.style.display = "block";
    contentEl.classList.remove("empty");

    markdownEl.innerHTML = marked.parse(text) as string;
    contentEl.scrollTop = 0;

    const fileDir = filePath.split("/").slice(0, -1);
    if (fileDir.join("/") !== currentPath.join("/")) {
      currentPath = fileDir;
      await renderSidebar();
    }

    const currentDir = filePath.split("/").slice(0, -1);
    interceptLinks(currentDir);
    highlightSidebar();
    buildOutline();
  } catch (e) {
    console.error("Failed to load file:", filePath, e);
  }
}

// --- Right outline ---

function buildOutline(): void {
  if (scrollObserver) scrollObserver.disconnect();

  const headings = markdownEl.querySelectorAll("h2, h3");
  outlineNav.innerHTML = "";

  if (headings.length === 0) {
    outlineEl.style.display = "none";
    return;
  }

  outlineEl.style.display = "block";
  const items: { el: HTMLAnchorElement; heading: Element }[] = [];

  for (const h of headings) {
    const item = document.createElement("a");
    item.className = "outline-item";
    if (h.tagName === "H3") item.classList.add("depth-3");
    item.textContent = h.textContent;
    item.dataset.targetId = h.id;
    item.addEventListener("click", () => {
      h.scrollIntoView({ behavior: "smooth" });
    });
    outlineNav.appendChild(item);
    items.push({ el: item, heading: h });
  }

  scrollObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          for (const i of items) {
            i.el.classList.toggle("active", i.heading.id === id);
          }
        }
      }
    },
    {
      root: contentEl,
      rootMargin: "0px 0px -70% 0px",
      threshold: 0.1,
    }
  );

  for (const h of headings) {
    scrollObserver.observe(h);
  }
}

// --- Link interception ---

function interceptLinks(currentDir: string[]): void {
  for (const a of markdownEl.querySelectorAll("a")) {
    const href = a.getAttribute("href");
    if (!href) continue;

    const linkType = classifyLink(href);

    if (linkType === "external") {
      a.target = "_blank";
      a.rel = "noopener";
      continue;
    }

    if (linkType === "anchor") {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const id = href.slice(1);
        const target = markdownEl.querySelector(`#${CSS.escape(id)}`);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      });
      continue;
    }

    if (linkType === "markdown") {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const { filePart, anchor } = parseMarkdownHref(href);
        const resolved = resolvePath([...currentDir], filePart);
        loadFile(resolved).then(() => {
          if (anchor) {
            const target = markdownEl.querySelector(
              `#${CSS.escape(anchor)}`
            );
            if (target) target.scrollIntoView({ behavior: "smooth" });
          }
        });
      });
    }
  }
}

function highlightSidebar(): void {
  for (const item of fileList.querySelectorAll(".file-item")) {
    item.classList.remove("active");
  }
  if (!activeFile) return;
  const activeName = activeFile.split("/").pop();
  const activeDir = activeFile.split("/").slice(0, -1).join("/");
  if (activeDir === currentPath.join("/")) {
    for (const item of fileList.querySelectorAll(".file-item")) {
      if (item.querySelector(".name")?.textContent === activeName) {
        item.classList.add("active");
      }
    }
  }
}

init();
