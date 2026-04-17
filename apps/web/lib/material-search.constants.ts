export const MAX_QUERY_LENGTH = 220;
export const MAX_TOKEN_COUNT = 8;
export const MAX_PHRASE_COUNT = 4;
export const SEARCH_ROW_LIMIT = 60;
export const RESULT_LIMIT = 3;
export const SNIPPET_LENGTH = 160;
export const SNIPPET_PADDING = 46;

export const QUOTED_SEGMENT_REGEX = /"([^"]+)"|'([^']+)'|вЂћ([^вЂњ]+)вЂњ|вЂњ([^вЂќ]+)вЂќ/g;
export const TOKEN_REGEX = /[\p{L}\p{N}#+-]{2,}/gu;
export const COLLAPSE_WHITESPACE_REGEX = /\s+/g;
export const HTML_TAG_REGEX = /<[^>]+>/g;

export const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i", "in",
  "is", "it", "me", "my", "of", "on", "or", "that", "the", "this", "to", "was",
  "what", "where", "which", "with", "you", "your",
  "Р°Р·", "Р°РєРѕ", "РІ", "РІСЉРІ", "РІРµС‡Рµ", "РіРѕ", "РґР°", "РґРѕ", "Рµ", "Р·Р°", "Рё", "РёР·", "РёР»Рё",
  "РєР°Рє", "РєСЉРґРµ", "Р»Рё", "РјРµ", "РјРё", "РјРѕР¶Рµ", "РјРѕР¶РµС€", "РЅР°", "РЅРµ", "РЅСЏРєСЉРґРµ", "РїРѕ", "СЃ",
  "СЃР°", "СЃРµ", "СЃРё", "СЃСЉРј", "СЃСЉСЃ", "С‚Рё", "С‚РѕРІР°", "С‚Рѕ", "С‚РѕР№", "С‚СЏ", "С‡Рµ",
  "material", "materials", "find", "search", "finder", "РЅР°РјРµСЂРё", "С‚СЉСЂСЃРё",
  "РјР°С‚РµСЂРёР°Р»", "РјР°С‚РµСЂРёР°Р»Рё",
]);
