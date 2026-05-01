export const MAX_QUERY_LENGTH = 220;
export const MAX_TOKEN_COUNT = 8;
export const MAX_PHRASE_COUNT = 4;
export const SEARCH_ROW_LIMIT = 60;
export const RESULT_LIMIT = 3;
export const SNIPPET_LENGTH = 160;
export const SNIPPET_PADDING = 46;

export const QUOTED_SEGMENT_REGEX = /"([^"]+)"|'([^']+)'|„([^“]+)“|“([^”]+)”/g;
export const TOKEN_REGEX = /[\p{L}\p{N}#+-]{2,}/gu;
export const COLLAPSE_WHITESPACE_REGEX = /\s+/g;
export const HTML_TAG_REGEX = /<[^>]+>/g;

export const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i", "in",
  "is", "it", "me", "my", "of", "on", "or", "that", "the", "this", "to", "was",
  "what", "where", "which", "with", "you", "your",
  "аз", "ако", "в", "във", "вече", "го", "да", "до", "е", "за", "и", "из", "или",
  "как", "къде", "ли", "ме", "ми", "може", "можеш", "на", "не", "някъде", "по", "с",
  "са", "се", "си", "съм", "със", "ти", "това", "то", "той", "тя", "че",
  "material", "materials", "find", "search", "finder", "намери", "търси",
  "материал", "материали",
]);
