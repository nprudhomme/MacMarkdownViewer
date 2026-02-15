import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { Marked } from "marked";
import markedAlert from "marked-alert";
import { markedEmoji } from "marked-emoji";
import extendedTables from "marked-extended-tables";
import markedFootnote from "marked-footnote";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";
import { markedSmartypants } from "marked-smartypants";

export const emojis: Record<string, string> = {
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

export const purifyConfig = {
  USE_PROFILES: { html: true, mathMl: true },
  ADD_TAGS: ["input"],
  ADD_ATTR: [
    "id",
    "style",
    "disabled",
    "checked",
    "type",
    "aria-hidden",
    "data-footnote-ref",
    "data-footnote-backref",
  ],
};

export function parseMarkdown(text: string): string {
  const rawHtml = marked.parse(text) as string;
  return DOMPurify.sanitize(rawHtml, purifyConfig) as string;
}
