import { Marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";
import markedAlert from "marked-alert";
import markedFootnote from "marked-footnote";
import { markedSmartypants } from "marked-smartypants";
import extendedTables from "marked-extended-tables";
import { markedEmoji } from "marked-emoji";
import hljs from "highlight.js";
import mermaid from "mermaid";
import DOMPurify from "dompurify";
import "katex/dist/katex.min.css";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { resolveResource } from "@tauri-apps/api/path";
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

const emojis: Record<string, string> = {
  rocket: "\u{1F680}",
  thumbsup: "\u{1F44D}",
  thumbsdown: "\u{1F44E}",
  heart: "\u2764\uFE0F",
  fire: "\u{1F525}",
  star: "\u2B50",
  check: "\u2705",
  x: "\u274C",
  warning: "\u26A0\uFE0F",
  info: "\u2139\uFE0F",
  bulb: "\u{1F4A1}",
  memo: "\u{1F4DD}",
  bug: "\u{1F41B}",
  sparkles: "\u2728",
  tada: "\u{1F389}",
  eyes: "\u{1F440}",
  thinking: "\u{1F914}",
  clap: "\u{1F44F}",
  muscle: "\u{1F4AA}",
  wave: "\u{1F44B}",
  pray: "\u{1F64F}",
  coffee: "\u2615",
  zap: "\u26A1",
  gear: "\u2699\uFE0F",
  lock: "\u{1F512}",
  key: "\u{1F511}",
  globe: "\u{1F310}",
  package: "\u{1F4E6}",
  link: "\u{1F517}",
  bookmark: "\u{1F516}",
  pencil: "\u270F\uFE0F",
  scissors: "\u2702\uFE0F",
  clipboard: "\u{1F4CB}",
  calendar: "\u{1F4C5}",
  clock: "\u{1F570}\uFE0F",
  hourglass: "\u231B",
  mag: "\u{1F50D}",
  chart: "\u{1F4CA}",
  hammer: "\u{1F528}",
  wrench: "\u{1F527}",
  shield: "\u{1F6E1}\uFE0F",
  trophy: "\u{1F3C6}",
  medal: "\u{1F3C5}",
  dart: "\u{1F3AF}",
  100: "\u{1F4AF}",
  boom: "\u{1F4A5}",
  construction: "\u{1F6A7}",
  recycle: "\u267B\uFE0F",
  white_check_mark: "\u2705",
  heavy_check_mark: "\u2714\uFE0F",
  arrow_right: "\u27A1\uFE0F",
  arrow_left: "\u2B05\uFE0F",
  arrow_up: "\u2B06\uFE0F",
  arrow_down: "\u2B07\uFE0F",
  plus: "\u2795",
  minus: "\u2796",
  point_right: "\u{1F449}",
  point_left: "\u{1F448}",
  smile: "\u{1F604}",
  wink: "\u{1F609}",
  sunglasses: "\u{1F60E}",
  sweat_smile: "\u{1F605}",
  joy: "\u{1F602}",
  sob: "\u{1F62D}",
  rage: "\u{1F621}",
  skull: "\u{1F480}",
  ghost: "\u{1F47B}",
  robot: "\u{1F916}",
  alien: "\u{1F47D}",
  dog: "\u{1F436}",
  cat: "\u{1F431}",
  unicorn: "\u{1F984}",
  snake: "\u{1F40D}",
  crab: "\u{1F980}",
  earth_americas: "\u{1F30E}",
  sun: "\u2600\uFE0F",
  moon: "\u{1F319}",
  cloud: "\u2601\uFE0F",
  rainbow: "\u{1F308}",
  snowflake: "\u2744\uFE0F",
  pizza: "\u{1F355}",
  beer: "\u{1F37A}",
  wine: "\u{1F377}",
  apple: "\u{1F34E}",
  lemon: "\u{1F34B}",
  cherries: "\u{1F352}",
};

const marked = new Marked();
marked.use(gfmHeadingId());
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);
marked.use(markedKatex({ throwOnError: false }));
marked.use(markedAlert());
marked.use(markedFootnote());
marked.use(extendedTables());
marked.use(markedSmartypants());
marked.use(
  markedEmoji({
    emojis,
    renderer(token) {
      const safeName = token.name.replace(/"/g, "&quot;");
      return `<span class="marked-emoji" data-emoji="${safeName}">${token.emoji}</span>`;
    },
  })
);

// --- Theme management ---

const THEME_KEY = "theme";
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;

function isDark(): boolean {
  return document.documentElement.dataset.theme === "dark";
}

function applyTheme(dark: boolean): void {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeToggle.textContent = dark ? "\u2600\uFE0F" : "\u{1F319}";
  mermaid.initialize({
    startOnLoad: false,
    theme: dark ? "dark" : "default",
    securityLevel: "loose",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  });
}

async function initTheme(): Promise<void> {
  const store = await load(STORE_FILE);
  const saved = (await store.get(THEME_KEY)) as string | null;
  if (saved) {
    applyTheme(saved === "dark");
  } else {
    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }
}

themeToggle.addEventListener("click", async () => {
  const newDark = !isDark();
  applyTheme(newDark);
  const store = await load(STORE_FILE);
  await store.set(THEME_KEY, newDark ? "dark" : "light");
  await store.save();
});

let mermaidCounter = 0;

async function renderMermaidDiagrams(): Promise<void> {
  const codeBlocks = markdownEl.querySelectorAll(
    "pre > code.language-mermaid"
  );
  if (codeBlocks.length === 0) return;

  for (const codeBlock of codeBlocks) {
    const pre = codeBlock.parentElement!;
    const source = codeBlock.textContent ?? "";
    const id = `mermaid-${++mermaidCounter}`;

    let title = "Diagram";
    const prevEl = pre.previousElementSibling;
    if (prevEl && /^H[2-4]$/.test(prevEl.tagName)) {
      title = prevEl.textContent ?? "Diagram";
    }

    try {
      const { svg } = await mermaid.render(id, source);

      const wrapper = document.createElement("div");
      wrapper.className = "mermaid-wrapper";

      const btn = document.createElement("button");
      btn.className = "mermaid-fullscreen-btn";
      btn.innerHTML = "<span>&#x26F6;</span> Fullscreen";
      btn.addEventListener("click", () => openMermaidFullscreen(svg, title));

      const preview = document.createElement("div");
      preview.className = "mermaid-preview";
      preview.innerHTML = svg;

      wrapper.appendChild(btn);
      wrapper.appendChild(preview);
      pre.replaceWith(wrapper);
    } catch (e) {
      console.warn("Mermaid render failed for diagram", id, e);
      const errWrapper = document.createElement("div");
      errWrapper.className = "mermaid-wrapper";
      errWrapper.style.borderColor = "#ef4444";
      const errMsg = document.createElement("div");
      errMsg.style.cssText = "padding:12px 16px;font-size:12px;color:#ef4444;";
      errMsg.textContent = "Mermaid syntax error — showing source";
      const srcPre = document.createElement("pre");
      srcPre.style.cssText = "margin:0;border-radius:0 0 8px 8px;";
      const srcCode = document.createElement("code");
      srcCode.textContent = source;
      srcPre.appendChild(srcCode);
      errWrapper.appendChild(errMsg);
      errWrapper.appendChild(srcPre);
      pre.replaceWith(errWrapper);
      document.getElementById(id)?.remove();
    }
  }
}

function addCopyButtons(): void {
  for (const pre of markdownEl.querySelectorAll("pre")) {
    if (!pre.querySelector("code")) continue;
    if (pre.querySelector(".copy-btn")) continue;

    pre.style.position = "relative";
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      if (!code) return;
      navigator.clipboard.writeText(code.textContent ?? "").then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      });
    });
    pre.appendChild(btn);
  }
}

function addImageLightbox(): void {
  for (const img of markdownEl.querySelectorAll("img")) {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => openImageOverlay(img as HTMLImageElement));
  }
}

function openImageOverlay(img: HTMLImageElement): void {
  const overlay = document.createElement("div");
  overlay.className = "image-overlay";

  const fullImg = document.createElement("img");
  fullImg.src = img.src;
  fullImg.alt = img.alt;
  fullImg.className = "image-overlay-img";

  overlay.appendChild(fullImg);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add("visible"));

  function closeOverlay() {
    overlay.classList.remove("visible");
    document.removeEventListener("keydown", onKeyDown);
    setTimeout(() => overlay.remove(), 200);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") closeOverlay();
  }

  document.addEventListener("keydown", onKeyDown);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlay();
  });
}

function openMermaidFullscreen(svgContent: string, title: string): void {
  const overlay = document.createElement("div");
  overlay.className = "mermaid-overlay";

  const header = document.createElement("div");
  header.className = "mermaid-overlay-header";

  const titleEl = document.createElement("div");
  titleEl.className = "mermaid-overlay-title";
  titleEl.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.className = "mermaid-overlay-close";
  closeBtn.textContent = "Close (Esc)";
  closeBtn.addEventListener("click", () => closeOverlay());

  header.appendChild(titleEl);
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "mermaid-overlay-body";
  body.innerHTML = svgContent;

  const svg = body.querySelector("svg");
  if (svg) {
    svg.removeAttribute("width");
    svg.style.maxWidth = "95vw";
    svg.style.height = "auto";
  }

  overlay.appendChild(header);
  overlay.appendChild(body);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add("visible"));

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") closeOverlay();
  }
  document.addEventListener("keydown", onKeyDown);

  function closeOverlay() {
    overlay.classList.remove("visible");
    document.removeEventListener("keydown", onKeyDown);
    setTimeout(() => overlay.remove(), 200);
  }
}

const fileList = document.getElementById("file-list") as HTMLDivElement;
const breadcrumb = document.getElementById("breadcrumb") as HTMLDivElement;
const markdownEl = document.getElementById("markdown") as HTMLDivElement;
const emptyState = document.getElementById("empty-state") as HTMLDivElement;
const contentEl = document.getElementById("content") as HTMLDivElement;
const openBtn = document.getElementById("open-btn") as HTMLButtonElement;
const examplesBtn = document.getElementById("examples-btn") as HTMLButtonElement;
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
examplesBtn.addEventListener("click", openExamples);

async function openExamples(): Promise<void> {
  const examplesPath = await resolveResource("examples");
  await setRootPath(examplesPath);
}

async function init(): Promise<void> {
  await initTheme();
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

    const rawHtml = marked.parse(text) as string;
    markdownEl.innerHTML = DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true, mathMl: true },
      ADD_TAGS: ["input"],
      ADD_ATTR: [
        "style",
        "disabled",
        "checked",
        "type",
        "aria-hidden",
        "data-footnote-ref",
        "data-footnote-backref",
      ],
    });
    contentEl.scrollTop = 0;

    await renderMermaidDiagrams();
    addCopyButtons();
    addImageLightbox();

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
