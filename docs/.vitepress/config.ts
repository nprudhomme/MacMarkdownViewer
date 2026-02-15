import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Markdown Viewer",
  description: "Native macOS markdown documentation viewer",
  base: "/MacMarkdownViewer/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/markdown-support" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Features", link: "/guide/features" },
          { text: "Security", link: "/guide/security" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Markdown Support", link: "/reference/markdown-support" },
          {
            text: "Keyboard Shortcuts",
            link: "/reference/keyboard-shortcuts",
          },
        ],
      },
      {
        text: "Contributing",
        link: "/contributing",
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/nprudhomme/MacMarkdownViewer",
      },
    ],
  },
});
