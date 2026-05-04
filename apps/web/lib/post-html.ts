import DOMPurify from "isomorphic-dompurify";
import { hasPostImage } from "./post-images";

const EMPTY_INLINE_FRAGMENT = "(?:\\s|&nbsp;|<br\\s*/?>)*";
const EMPTY_PARAGRAPH_RE = new RegExp(`<p>${EMPTY_INLINE_FRAGMENT}</p>`, "gi");
const EMPTY_LIST_ITEM_RE = new RegExp(
  `<li>(?:${EMPTY_INLINE_FRAGMENT}|<p>${EMPTY_INLINE_FRAGMENT}</p>)*</li>`,
  "gi"
);
const EMPTY_LIST_RE = /<(ul|ol)>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi;
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "a",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "img",
];
const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "colspan",
  "rowspan",
  "src",
  "alt",
  "width",
  "height",
];

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizePostHtmlContent(rawContent: string): string {
  let normalized = rawContent.trim();

  // Remove empty paragraphs generated while exiting list mode in the editor.
  normalized = normalized.replace(EMPTY_PARAGRAPH_RE, "");
  // Remove empty bullets/numbers such as <li><p></p></li>.
  normalized = normalized.replace(EMPTY_LIST_ITEM_RE, "");
  // Remove lists that became empty after cleanup.
  normalized = normalized.replace(EMPTY_LIST_RE, "");
  // Avoid "floating" second rows from repeated hard-breaks inside list items.
  normalized = normalized.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>");

  return normalized.trim();
}

export function sanitizePostHtml(rawContent: string): string {
  const normalized = normalizePostHtmlContent(rawContent);

  return DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function hasMeaningfulPostHtmlContent(rawContent: string): boolean {
  const textOnly = rawContent
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ");

  return collapseWhitespace(textOnly).length > 0 || hasPostImage(rawContent);
}
