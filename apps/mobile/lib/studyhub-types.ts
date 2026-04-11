export type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
};

export type Module = {
  id: number;
  courseId?: number;
  title: string;
  description?: string | null;
  orderIndex: number;
};

export type ModuleContext = {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
};

export type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
  createdAt?: string;
};

export type FavoriteItem = {
  id: number;
  materialId: number;
  materialTitle: string;
  materialType: string;
  tags: string | null;
  moduleId: number;
  moduleTitle: string;
  courseId: number;
  courseTitle: string;
};

export const AI_TOOL_NAMES = [
  "summarize",
  "summarize-short",
  "quiz",
  "flashcards",
  "definitions",
] as const;

export type ToolName = typeof AI_TOOL_NAMES[number];

export type QuizQuestion = {
  question: string;
  options: string[];
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type Definition = {
  term: string;
  definition: string;
};

export type ToolDataMap = {
  summarize: string;
  "summarize-short": string;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  definitions: Definition[];
};

export type ToolResult = {
  [K in ToolName]: {
    tool: K;
    data: ToolDataMap[K];
  };
}[ToolName];

export type SavedAiToolOutput = ToolResult & {
  id: number;
  userId: number;
  materialId: number;
  createdAt: string;
};

export function isToolName(tool: string): tool is ToolName {
  return AI_TOOL_NAMES.includes(tool as ToolName);
}

export function isQuizQuestion(value: unknown): value is QuizQuestion {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.question === "string" &&
    Array.isArray(v.options) &&
    v.options.length === 4 &&
    v.options.every((o) => typeof o === "string") &&
    ["A", "B", "C", "D"].includes(v.correct as string) &&
    typeof v.explanation === "string"
  );
}

export function isFlashcard(value: unknown): value is Flashcard {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.front === "string" && typeof v.back === "string";
}

export function isDefinition(value: unknown): value is Definition {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.term === "string" && typeof v.definition === "string";
}

export function isToolData(tool: ToolName, value: unknown): value is ToolDataMap[ToolName] {
  switch (tool) {
    case "summarize":
    case "summarize-short":
      return typeof value === "string";
    case "quiz":
      return Array.isArray(value) && value.length === 5 && value.every(isQuizQuestion);
    case "flashcards":
      return Array.isArray(value) && value.length > 0 && value.every(isFlashcard);
    case "definitions":
      return Array.isArray(value) && value.length > 0 && value.every(isDefinition);
    default:
      return false;
  }
}

export function isSavedAiToolOutput(value: unknown): value is SavedAiToolOutput {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as SavedAiToolOutput;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.userId === "number" &&
    typeof candidate.materialId === "number" &&
    typeof candidate.createdAt === "string" &&
    isToolName(candidate.tool) &&
    isToolData(candidate.tool, candidate.data)
  );
}

export type ChatMessage = {
  role: "user" | "model";
  parts: string;
};

