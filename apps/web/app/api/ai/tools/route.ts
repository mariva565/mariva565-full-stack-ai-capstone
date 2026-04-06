import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/api-utils";
import { askGemini, askGeminiJson } from "../../../../lib/gemini";

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
    "Keep the questions and explanations concise. Each explanation must be a single short sentence. " +
    "Reply in JSON format: [{\"question\": \"...\", \"options\": [\"A. ...\", \"B. ...\", \"C. ...\", \"D. ...\"], \"correct\": \"A\", \"explanation\": \"...\"}]. " +
    "Reply in the same language as the content. Return ONLY valid JSON, no extra text.",

  flashcards:
    "You are a study assistant. Generate up to 8 flashcards from the following study material. " +
    "Each flashcard has a front (question or term) and back (answer or definition). " +
    "Keep both sides concise and study-friendly. " +
    "Reply in JSON format: [{\"front\": \"...\", \"back\": \"...\"}]. " +
    "Reply in the same language as the content. Return ONLY valid JSON, no extra text.",

  definitions:
    "You are a study assistant. Extract all key terms and their definitions from the following study material. " +
    "Keep each definition concise and factual. " +
    "Reply in JSON format: [{\"term\": \"...\", \"definition\": \"...\"}]. " +
    "Reply in the same language as the content. Return ONLY valid JSON, no extra text.",
};

const MAX_CONTENT_LENGTH = 10000;
const STRUCTURED_TOOLS = ["quiz", "flashcards", "definitions"] as const;

type StructuredToolName = (typeof STRUCTURED_TOOLS)[number];

type QuizQuestion = {
  question: string;
  options: string[];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

type Flashcard = {
  front: string;
  back: string;
};

type Definition = {
  term: string;
  definition: string;
};

const STRUCTURED_TOOL_SCHEMAS: Record<StructuredToolName, Record<string, unknown>> = {
  quiz: {
    type: "array",
    minItems: 5,
    maxItems: 5,
    items: {
      type: "object",
      additionalProperties: false,
      required: ["question", "options", "correct", "explanation"],
      properties: {
        question: { type: "string" },
        options: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: { type: "string" },
        },
        correct: {
          type: "string",
          enum: ["A", "B", "C", "D"],
        },
        explanation: { type: "string" },
      },
    },
  },
  flashcards: {
    type: "array",
    minItems: 1,
    maxItems: 8,
    items: {
      type: "object",
      additionalProperties: false,
      required: ["front", "back"],
      properties: {
        front: { type: "string" },
        back: { type: "string" },
      },
    },
  },
  definitions: {
    type: "array",
    minItems: 1,
    items: {
      type: "object",
      additionalProperties: false,
      required: ["term", "definition"],
      properties: {
        term: { type: "string" },
        definition: { type: "string" },
      },
    },
  },
};

function isStructuredTool(tool: string): tool is StructuredToolName {
  return STRUCTURED_TOOLS.includes(tool as StructuredToolName);
}

function isQuizQuestion(value: unknown): value is QuizQuestion {
  if (typeof value !== "object" || value === null) return false;

  const question = (value as QuizQuestion).question;
  const options = (value as QuizQuestion).options;
  const correct = (value as QuizQuestion).correct;
  const explanation = (value as QuizQuestion).explanation;

  return (
    typeof question === "string" &&
    Array.isArray(options) &&
    options.length === 4 &&
    options.every((option) => typeof option === "string") &&
    ["A", "B", "C", "D"].includes(correct) &&
    typeof explanation === "string"
  );
}

function isFlashcard(value: unknown): value is Flashcard {
  if (typeof value !== "object" || value === null) return false;

  return (
    typeof (value as Flashcard).front === "string" &&
    typeof (value as Flashcard).back === "string"
  );
}

function isDefinition(value: unknown): value is Definition {
  if (typeof value !== "object" || value === null) return false;

  return (
    typeof (value as Definition).term === "string" &&
    typeof (value as Definition).definition === "string"
  );
}

function isValidStructuredResult(
  tool: StructuredToolName,
  value: unknown,
): value is QuizQuestion[] | Flashcard[] | Definition[] {
  if (!Array.isArray(value)) return false;

  switch (tool) {
    case "quiz":
      return value.length === 5 && value.every(isQuizQuestion);
    case "flashcards":
      return value.length > 0 && value.every(isFlashcard);
    case "definitions":
      return value.length > 0 && value.every(isDefinition);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const tool = typeof body?.tool === "string" ? body.tool : "";
    const content = typeof body?.content === "string" ? body.content : "";

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

    const trimmedContent = content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (!trimmedContent) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "content cannot be empty" },
        { status: 400 }
      );
    }

    if (isStructuredTool(tool)) {
      const maxTokens = tool === "quiz" ? 6144 : 3072;
      const data = await askGeminiJson<unknown>({
        systemPrompt,
        userMessage: trimmedContent,
        temperature: tool === "definitions" ? 0.2 : 0.3,
        maxTokens,
        responseJsonSchema: STRUCTURED_TOOL_SCHEMAS[tool],
      });

      if (!isValidStructuredResult(tool, data)) {
        throw new Error(`Gemini returned an invalid ${tool} payload`);
      }

      return NextResponse.json({ tool, data });
    }

    const result = await askGemini({
      systemPrompt,
      userMessage: trimmedContent,
      temperature: 0.4,
      maxTokens: 2048,
    });

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

    if (
      message.includes("invalid JSON") ||
      message.includes("truncated") ||
      message.includes("invalid quiz payload") ||
      message.includes("invalid flashcards payload") ||
      message.includes("invalid definitions payload")
    ) {
      return NextResponse.json(
        {
          code: "AI_INVALID_RESPONSE",
          message: "AI returned an incomplete result. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { code: "AI_ERROR", message: "AI service temporarily unavailable" },
      { status: 502 }
    );
  }
}
