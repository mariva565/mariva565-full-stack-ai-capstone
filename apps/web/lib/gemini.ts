const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

interface GeminiMessage {
  role: "user" | "model";
  parts: string;
}

interface GeminiOptions {
  systemPrompt: string;
  userMessage: string;
  history?: GeminiMessage[];
  maxTokens?: number;
  temperature?: number;
}

export async function askGemini(options: GeminiOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const {
    systemPrompt,
    userMessage,
    history = [],
    maxTokens = 2048,
    temperature = 0.4,
  } = options;

  const contents = [
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature },
  };

  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        lastError = data?.error?.message || `HTTP ${res.status}`;
        continue;
      }

      const parts = data?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) continue;

      const text = parts
        .map((p: { text?: string }) => p.text ?? "")
        .join("")
        .trim();

      if (text) return text;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}
