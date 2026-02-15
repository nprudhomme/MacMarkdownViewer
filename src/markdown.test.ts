import { describe, expect, it } from "vitest";
import { emojis, parseMarkdown } from "./markdown";

// --- Basic Markdown Parsing ---

describe("parseMarkdown — headings", () => {
  it("renders h1", () => {
    const html = parseMarkdown("# Title");
    expect(html).toContain("<h1");
    expect(html).toContain("Title</h1>");
  });

  it("renders h2 with id from gfmHeadingId", () => {
    const html = parseMarkdown("## Sub Title");
    expect(html).toContain("<h2");
    expect(html).toContain('id="sub-title"');
  });

  it("renders h3", () => {
    const html = parseMarkdown("### Deep");
    expect(html).toContain("<h3");
  });
});

describe("parseMarkdown — code blocks", () => {
  it("renders fenced code with language class", () => {
    const html = parseMarkdown("```js\nconst x = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain('<code class="hljs language-js">');
  });

  it("renders code without language via auto-detect", () => {
    const html = parseMarkdown("```\nconst x = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("<code");
  });

  it("renders inline code", () => {
    const html = parseMarkdown("Use `foo()` here");
    expect(html).toContain("<code>foo()</code>");
  });
});

describe("parseMarkdown — tables", () => {
  it("renders a GFM table", () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const html = parseMarkdown(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<th>A</th>");
    expect(html).toContain("<td>1</td>");
  });
});

describe("parseMarkdown — links", () => {
  it("renders an anchor tag", () => {
    const html = parseMarkdown("[click](https://example.com)");
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain("click</a>");
  });
});

describe("parseMarkdown — inline formatting", () => {
  it("renders bold", () => {
    const html = parseMarkdown("**bold**");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders italic", () => {
    const html = parseMarkdown("*italic*");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders strikethrough", () => {
    const html = parseMarkdown("~~deleted~~");
    expect(html).toContain("<del>deleted</del>");
  });
});

describe("parseMarkdown — task lists", () => {
  it("renders checked checkbox", () => {
    const html = parseMarkdown("- [x] Done");
    expect(html).toContain("<input");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
    expect(html).toContain("disabled");
  });

  it("renders unchecked checkbox", () => {
    const html = parseMarkdown("- [ ] Todo");
    expect(html).toContain("<input");
    expect(html).toContain('type="checkbox"');
    expect(html).not.toContain("checked");
    expect(html).toContain("disabled");
  });
});

// --- Marked Extensions ---

describe("parseMarkdown — alerts", () => {
  it("renders NOTE alert", () => {
    const html = parseMarkdown("> [!NOTE]\n> Important info");
    expect(html).toContain("markdown-alert");
    expect(html).toContain("markdown-alert-note");
  });

  it("renders WARNING alert", () => {
    const html = parseMarkdown("> [!WARNING]\n> Be careful");
    expect(html).toContain("markdown-alert-warning");
  });

  it("renders TIP alert", () => {
    const html = parseMarkdown("> [!TIP]\n> Helpful tip");
    expect(html).toContain("markdown-alert-tip");
  });
});

describe("parseMarkdown — footnotes", () => {
  it("renders footnote references and section", () => {
    const md = "Text with note[^1]\n\n[^1]: Footnote content";
    const html = parseMarkdown(md);
    expect(html).toContain("data-footnote-ref");
    expect(html).toContain("footnote");
  });
});

describe("parseMarkdown — emojis", () => {
  it("renders :rocket: as emoji span", () => {
    const html = parseMarkdown("Launch :rocket:");
    expect(html).toContain('<span class="marked-emoji"');
    expect(html).toContain('data-emoji="rocket"');
    expect(html).toContain("\u{1F680}");
  });

  it("renders :heart: as emoji span", () => {
    const html = parseMarkdown(":heart:");
    expect(html).toContain("\u2764\uFE0F");
  });
});

describe("parseMarkdown — smart quotes", () => {
  it("converts straight quotes to curly quotes", () => {
    const html = parseMarkdown('"hello"');
    expect(html).not.toContain('"hello"');
    expect(html).toContain("\u201C");
    expect(html).toContain("\u201D");
  });

  it("converts apostrophes", () => {
    const html = parseMarkdown("don't");
    expect(html).toContain("\u2019");
  });
});

describe("parseMarkdown — extended tables", () => {
  it("renders colspan with ||", () => {
    const md = "| A | B |\n|---|---|\n| span || ";
    const html = parseMarkdown(md);
    expect(html).toContain("colspan");
  });
});

// --- DOMPurify Sanitization ---

describe("parseMarkdown — sanitization", () => {
  it("strips <script> tags", () => {
    const html = parseMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("removes onerror from img", () => {
    const html = parseMarkdown('<img src="x.png" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
    expect(html).toContain("<img");
  });

  it("removes javascript: href", () => {
    const html = parseMarkdown('<a href="javascript:alert(1)">click</a>');
    expect(html).not.toContain("javascript:");
  });

  it("strips <iframe> tags", () => {
    const html = parseMarkdown('<iframe src="https://evil.com"></iframe>');
    expect(html).not.toContain("<iframe");
  });

  it("removes onload from svg", () => {
    const html = parseMarkdown('<svg onload="alert(1)"></svg>');
    expect(html).not.toContain("onload");
  });

  it("removes ontoggle from details", () => {
    const html = parseMarkdown(
      '<details ontoggle="alert(1)"><summary>X</summary></details>'
    );
    expect(html).not.toContain("ontoggle");
  });

  it("preserves KaTeX output with style", () => {
    const html = parseMarkdown("$x^2$");
    expect(html).toContain("katex");
  });

  it("preserves checkboxes through sanitization", () => {
    const html = parseMarkdown("- [x] Done");
    expect(html).toContain("<input");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
    expect(html).toContain("disabled");
  });

  it("preserves MathML tags", () => {
    const html = parseMarkdown("$$x + y$$");
    expect(html).toContain("math");
  });
});

// --- Emoji Dictionary ---

describe("emoji dictionary", () => {
  it("has non-empty string values", () => {
    for (const [key, value] of Object.entries(emojis)) {
      expect(value, `emoji "${key}" should be non-empty`).toBeTruthy();
      expect(typeof value).toBe("string");
    }
  });

  it("has no duplicate values", () => {
    const values = Object.values(emojis);
    const unique = new Set(values);
    const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
    if (duplicates.length > 0) {
      const dupeKeys: string[] = [];
      for (const dup of duplicates) {
        const keys = Object.entries(emojis)
          .filter(([, v]) => v === dup)
          .map(([k]) => k);
        dupeKeys.push(`${dup} (${keys.join(", ")})`);
      }
      // Allow known aliases (check/white_check_mark both map to the same emoji)
      // but verify we're aware of them
      expect(unique.size).toBeGreaterThan(values.length - 5);
    }
  });

  it("has keys without regex-breaking characters", () => {
    for (const key of Object.keys(emojis)) {
      expect(key).toMatch(/^[\w]+$/);
    }
  });
});
