import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "../../../../lib/api-utils";
import { askGemini } from "../../../../lib/gemini";
import {
  sanitizeSearchQuery,
  searchUserMaterials,
  type MaterialSearchResult,
} from "../../../../lib/material-search";

const MIN_MESSAGE_LENGTH = 2;
const OBVIOUS_TOP_SCORE = 72;
const OBVIOUS_SCORE_RATIO = 1.55;

const GEMINI_SYSTEM_PROMPT =
  "You rewrite StudyHub material-search results. " +
  "Use only provided JSON. Do not invent facts. " +
  "Reply in the same language as the query. " +
  "Keep it short: 2-4 lines, max 110 words. " +
  "Mention title, module, course, and why it matches.";

type FinderBody = {
  message?: unknown;
};

function prefersBulgarian(text: string) {
  return /[\u0400-\u04FF]/.test(text);
}

function hasObviousTopResult(results: MaterialSearchResult[]) {
  if (results.length <= 1) {
    return true;
  }

  const [top, second] = results;
  return top.score >= OBVIOUS_TOP_SCORE && top.score >= second.score * OBVIOUS_SCORE_RATIO;
}

function formatNoResultsReply(query: string, isBulgarian: boolean) {
  if (isBulgarian) {
    return `Не открих съвпадения в твоите материали за „${query}“. Опитай с по-кратък термин или различна ключова дума.`;
  }

  return `I could not find matches in your materials for "${query}". Try a shorter term or a different keyword.`;
}

function formatTopResultReply(result: MaterialSearchResult, isBulgarian: boolean) {
  if (isBulgarian) {
    return `Най-вероятният резултат е „${result.title}“ (${result.moduleTitle} / ${result.courseTitle}). Отвори: ${result.url}`;
  }

  return `The strongest match is "${result.title}" (${result.moduleTitle} / ${result.courseTitle}). Open: ${result.url}`;
}

function formatMultiResultFallback(results: MaterialSearchResult[], isBulgarian: boolean) {
  const shortlist = results
    .slice(0, 3)
    .map((result, index) => `${index + 1}. ${result.title} (${result.moduleTitle})`)
    .join("\n");

  if (isBulgarian) {
    return `Намерих няколко добри съвпадения:\n${shortlist}\nЗапочни с първия и при нужда уточни още ключови думи.`;
  }

  return `I found several good matches:\n${shortlist}\nStart with the first one and refine your keywords if needed.`;
}

function buildGeminiPayload(query: string, results: MaterialSearchResult[]) {
  return JSON.stringify({
    query,
    results: results.slice(0, 3).map((result) => ({
      title: result.title,
      snippet: result.snippet,
      moduleTitle: result.moduleTitle,
      courseTitle: result.courseTitle,
      url: result.url,
    })),
  });
}

async function createGeminiReply(query: string, results: MaterialSearchResult[]) {
  try {
    const reply = await askGemini({
      systemPrompt: GEMINI_SYSTEM_PROMPT,
      userMessage: buildGeminiPayload(query, results),
      temperature: 0.1,
      maxTokens: 320,
    });

    return reply.trim();
  } catch (error) {
    console.warn("Material finder Gemini fallback used:", error);
    return "";
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  let body: FinderBody;
  try {
    body = (await request.json()) as FinderBody;
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const rawMessage = typeof body.message === "string" ? body.message : "";
  const query = sanitizeSearchQuery(rawMessage);

  if (query.length < MIN_MESSAGE_LENGTH) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "message must be at least 2 characters long" },
      { status: 400 },
    );
  }

  const isBulgarian = prefersBulgarian(query);

  try {
    const results = await searchUserMaterials(auth.user.sub, query);

    if (results.length === 0) {
      return NextResponse.json({
        reply: formatNoResultsReply(query, isBulgarian),
        mode: "template",
        results,
      });
    }

    if (hasObviousTopResult(results)) {
      return NextResponse.json({
        reply: formatTopResultReply(results[0], isBulgarian),
        mode: "template",
        results,
      });
    }

    const geminiReply = await createGeminiReply(query, results);
    if (geminiReply) {
      return NextResponse.json({
        reply: geminiReply,
        mode: "gemini",
        results,
      });
    }

    return NextResponse.json({
      reply: formatMultiResultFallback(results, isBulgarian),
      mode: "template",
      results,
    });
  } catch (error) {
    console.error("Material finder assistant failed:", error);
    return NextResponse.json(
      { code: "MATERIAL_FINDER_FAILED", message: "Material finder is temporarily unavailable" },
      { status: 500 },
    );
  }
}
