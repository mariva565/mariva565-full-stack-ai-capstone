import { and, desc, eq, ilike, or } from "drizzle-orm";

import { courses, materials, modules } from "../../../drizzle/schema";
import { db } from "./db";
import {
  COLLAPSE_WHITESPACE_REGEX,
  HTML_TAG_REGEX,
  MAX_PHRASE_COUNT,
  MAX_QUERY_LENGTH,
  MAX_TOKEN_COUNT,
  QUOTED_SEGMENT_REGEX,
  RESULT_LIMIT,
  SEARCH_ROW_LIMIT,
  SNIPPET_LENGTH,
  SNIPPET_PADDING,
  STOP_WORDS,
  TOKEN_REGEX,
} from "./material-search.constants";
import type {
  MaterialSearchCandidate,
  MaterialSearchRanked,
  MaterialSearchResult,
  MaterialSearchTerms,
} from "./material-search.types";
import { parseTags } from "./materials";

export type { MaterialSearchResult } from "./material-search.types";

function toLowerCollapsed(value: string) {
  return value.toLowerCase().replace(COLLAPSE_WHITESPACE_REGEX, " ").trim();
}

function toCleanText(value: string | null | undefined) {
  return (value ?? "").replace(HTML_TAG_REGEX, " ").replace(COLLAPSE_WHITESPACE_REGEX, " ").trim();
}

function tokenize(value: string) {
  return value.toLowerCase().match(TOKEN_REGEX) ?? [];
}

function uniqueValues(values: string[], maxCount: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = toLowerCollapsed(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);

    if (result.length >= maxCount) {
      break;
    }
  }

  return result;
}

function extractQuotedPhrases(query: string): string[] {
  const values: string[] = [];

  for (const match of query.matchAll(QUOTED_SEGMENT_REGEX)) {
    const segment = match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
    if (segment.trim()) {
      values.push(segment);
    }
  }

  return values;
}

function extractMeaningfulTokens(query: string): string[] {
  const tokens = tokenize(query)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));

  return uniqueValues(tokens, MAX_TOKEN_COUNT);
}

function buildPhraseCandidates(quoted: string[], tokens: string[]): string[] {
  const phrases = [...quoted];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    phrases.push(`${tokens[index]} ${tokens[index + 1]}`);
  }

  if (tokens.length >= 3) {
    phrases.push(tokens.slice(0, 3).join(" "));
  }

  return uniqueValues(phrases, MAX_PHRASE_COUNT);
}

export function sanitizeSearchQuery(rawQuery: string) {
  return rawQuery.replace(COLLAPSE_WHITESPACE_REGEX, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

function extractSearchTerms(rawQuery: string): MaterialSearchTerms {
  const normalizedQuery = toLowerCollapsed(rawQuery);
  const tokens = extractMeaningfulTokens(normalizedQuery);
  const quoted = extractQuotedPhrases(rawQuery);
  const phrases = buildPhraseCandidates(quoted, tokens);

  return { normalizedQuery, tokens, phrases };
}

function combineWithOr(conditions: ReturnType<typeof ilike>[]) {
  if (conditions.length === 1) {
    return conditions[0];
  }

  return or(...conditions)!;
}

function buildSearchFilters(terms: MaterialSearchTerms) {
  const values = [...terms.phrases, ...terms.tokens];

  return values.flatMap((value) => [
    ilike(materials.title, `%${value}%`),
    ilike(materials.content, `%${value}%`),
    ilike(materials.tags, `%${value}%`),
  ]);
}

async function fetchMaterialCandidates(userId: number, terms: MaterialSearchTerms) {
  const filters = buildSearchFilters(terms);
  if (filters.length === 0) {
    return [] as MaterialSearchCandidate[];
  }

  const rows = await db
    .select({
      id: materials.id,
      title: materials.title,
      content: materials.content,
      tags: materials.tags,
      createdAt: materials.createdAt,
      moduleTitle: modules.title,
      courseTitle: courses.title,
    })
    .from(materials)
    .innerJoin(modules, eq(materials.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(and(eq(materials.createdBy, userId), combineWithOr(filters)))
    .orderBy(desc(materials.createdAt))
    .limit(SEARCH_ROW_LIMIT);

  return rows as MaterialSearchCandidate[];
}

function scoreField(
  text: string,
  words: Set<string>,
  terms: MaterialSearchTerms,
  phrasePoints: number,
  exactPoints: number,
  partialPoints: number,
) {
  let score = 0;

  for (const phrase of terms.phrases) {
    if (text.includes(phrase)) {
      score += phrasePoints;
    }
  }

  for (const token of terms.tokens) {
    if (words.has(token)) {
      score += exactPoints;
    } else if (text.includes(token)) {
      score += partialPoints;
    }
  }

  return score;
}

function scoreCandidate(candidate: MaterialSearchCandidate, terms: MaterialSearchTerms) {
  const title = toLowerCollapsed(candidate.title);
  const tags = toLowerCollapsed(parseTags(candidate.tags).join(" "));
  const content = toLowerCollapsed(toCleanText(candidate.content));
  const titleWords = new Set(tokenize(title));
  const tagsWords = new Set(tokenize(tags));
  const contentWords = new Set(tokenize(content));

  let score = 0;
  score += scoreField(title, titleWords, terms, 90, 26, 16);
  score += scoreField(tags, tagsWords, terms, 62, 16, 10);
  score += scoreField(content, contentWords, terms, 38, 9, 5);

  if (terms.normalizedQuery.length >= 4) {
    if (title.includes(terms.normalizedQuery)) score += 52;
    if (tags.includes(terms.normalizedQuery)) score += 30;
    if (content.includes(terms.normalizedQuery)) score += 18;
  }

  return score;
}

function truncateSnippet(text: string) {
  if (text.length <= SNIPPET_LENGTH) {
    return text;
  }

  return `${text.slice(0, SNIPPET_LENGTH - 3).trimEnd()}...`;
}

function buildSnippet(candidate: MaterialSearchCandidate, terms: MaterialSearchTerms) {
  const content = toCleanText(candidate.content);
  const tagsText = parseTags(candidate.tags).join(", ");
  const source = content || tagsText || "";

  if (!source) {
    return "No preview available.";
  }

  const lookups = [...terms.phrases, ...terms.tokens];
  const lowerSource = source.toLowerCase();
  const matchIndex = lookups.reduce((index, value) => {
    if (index >= 0) return index;
    return lowerSource.indexOf(value);
  }, -1);

  if (matchIndex < 0) {
    return truncateSnippet(source);
  }

  const start = Math.max(0, matchIndex - SNIPPET_PADDING);
  const end = Math.min(source.length, start + SNIPPET_LENGTH);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < source.length ? "..." : "";

  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

function rankCandidates(candidates: MaterialSearchCandidate[], terms: MaterialSearchTerms) {
  const ranked = candidates
    .map((candidate) => {
      const score = scoreCandidate(candidate, terms);
      const createdAtTime = new Date(candidate.createdAt).getTime();

      const row: MaterialSearchRanked = {
        id: candidate.id,
        title: candidate.title,
        moduleTitle: candidate.moduleTitle,
        courseTitle: candidate.courseTitle,
        snippet: buildSnippet(candidate, terms),
        score,
        url: `/materials/${candidate.id}`,
        createdAtTime: Number.isNaN(createdAtTime) ? 0 : createdAtTime,
      };

      return row;
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.createdAtTime - left.createdAtTime;
    })
    .slice(0, RESULT_LIMIT);

  return ranked.map(({ createdAtTime: _createdAtTime, ...result }) => result);
}

export async function searchUserMaterials(userId: number, rawQuery: string) {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) {
    return [] as MaterialSearchResult[];
  }

  const terms = extractSearchTerms(query);
  if (terms.tokens.length === 0 && terms.phrases.length === 0) {
    return [] as MaterialSearchResult[];
  }

  const candidates = await fetchMaterialCandidates(userId, terms);
  if (candidates.length === 0) {
    return [] as MaterialSearchResult[];
  }

  return rankCandidates(candidates, terms);
}

