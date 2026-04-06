import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/api-utils";
import { askGemini } from "../../../../lib/gemini";

const TOOL_PROMPTS: Record<string, string> = {
  summarize:
    "You are a study assistant. Summarize the following study material clearly and concisely. " +
    "Use bullet points for key ideas. Reply in the same language as the content.",

  "summarize-short":
    "You are a study assistant. Summarize the following study material in 2-3 sentences maximum. " +
    "Reply in the same language as the content.",

  quiz:
    "You are a study assistant. Generate exactly 5 multiple-choice quiz questions from the following study material. " +
    "Each question must have exactly 4 options (A, B, C, D) and one correct answer. " +
    "Reply in JSON format: [{\"question\": \"...\", \"options\": [\"A. ...\", \"B. ...\", \"C. ...\", \"D. ...\"], \"correct\": \"A\", \"explanation\": \"...\"}]. " +
    "Reply in the same language as the content. Return ONLY valid JSON, no extra text.",

  flashcards:
    "You are a study assistant. Generate up to 8 flashcards from the following study material. " +
    "Each flashcard has a front (question or term) and back (answer or definition). " +
    "Reply in JSON format: [{\"front\": \"...\", \"back\": \"...\"}]. " +
    "Reply in the same language as the content. Return ONLY valid JSON, no extra text.",

  definitions:
    "You are a study assistant. Extract all key terms and their definitions from the following study material. " +
    "Reply in JSON format: [{\"term\": \"...\", \"definition\": \"...\"}]. " +
    "Reply in the same language as the content. Return ONLY valid JSON, no extra text.",
};

const MAX_CONTENT_LENGTH = 10000;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { tool, content } = body;

    if (!tool || !content) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "tool and content are required" },
        { status: 400 }
      );
    }

    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) {
      return NextResponse.json(
        {
          code: "BAD_REQUEST",
          message: `Unknown tool: ${tool}. Available: ${Object.keys(TOOL_PROMPTS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);

    const result = await askGemini({
      systemPrompt,
      userMessage: trimmedContent,
      temperature: tool === "quiz" || tool === "flashcards" ? 0.3 : 0.4,
    });

    // For JSON tools, try to parse and return structured data
    if (["quiz", "flashcards", "definitions"].includes(tool)) {
      try {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ tool, data: parsed });
        }
      } catch {
        // If JSON parsing fails, return raw text
      }
    }

    return NextResponse.json({ tool, data: result });
  } catch (err) {
    console.error("AI tools error:", err);
    const message =
      err instanceof Error ? err.message : "AI service unavailable";

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { code: "NOT_CONFIGURED", message: "AI is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { code: "AI_ERROR", message: "AI service temporarily unavailable" },
      { status: 502 }
    );
  }
}
