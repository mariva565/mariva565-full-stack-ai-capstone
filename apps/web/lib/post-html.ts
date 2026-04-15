const EMPTY_INLINE_FRAGMENT = "(?:\\s|&nbsp;|<br\\s*/?>)*";
const EMPTY_PARAGRAPH_RE = new RegExp(`<p>${EMPTY_INLINE_FRAGMENT}</p>`, "gi");
const EMPTY_LIST_ITEM_RE = new RegExp(
  `<li>(?:${EMPTY_INLINE_FRAGMENT}|<p>${EMPTY_INLINE_FRAGMENT}</p>)*</li>`,
  "gi"
);
const EMPTY_LIST_RE = /<(ul|ol)>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi;

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

export function hasMeaningfulPostHtmlContent(rawContent: string): boolean {
  const textOnly = rawContent
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ");

  return collapseWhitespace(textOnly).length > 0;
}
