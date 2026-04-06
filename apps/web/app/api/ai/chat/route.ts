import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/api-utils";
import { askGemini } from "../../../../lib/gemini";

const SYSTEM_PROMPT =
  "You are StudyHub Mentor, a helpful coding study assistant. " +
  "Answer the user's question directly and clearly. " +
  "Use practical explanations with short code examples when relevant. " +
  "Give thorough answers — do not cut them short. " +
  "Reply in the same language as the user.";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 20;

interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "message is required" },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!trimmedMessage) {
      return NextResponse.json(
        { code: "BAD_REQUEST", message: "message cannot be empty" },
        { status: 400 }
      );
    }

    // Sanitize history
    const safeHistory: ChatMessage[] = Array.isArray(history)
      ? history
          .slice(-MAX_HISTORY_ITEMS)
          .filter(
            (msg: unknown): msg is ChatMessage =>
              typeof msg === "object" &&
              msg !== null &&
              ("role" in msg) &&
              ("parts" in msg) &&
              (msg as ChatMessage).role === "user" ||
              (msg as ChatMessage).role === "model"
          )
          .map((msg: ChatMessage) => ({
            role: msg.role === "model" ? "model" as const : "user" as const,
            parts:
              typeof msg.parts === "string"
                ? msg.parts.slice(0, MAX_MESSAGE_LENGTH)
                : "",
          }))
          .filter((msg: ChatMessage) => msg.parts.length > 0)
      : [];

    const reply = await askGemini({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: trimmedMessage,
      history: safeHistory,
      maxTokens: 2048,
      temperature: 0.4,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err);
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
