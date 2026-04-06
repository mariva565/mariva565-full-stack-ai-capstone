export const AI_TOOL_NAMES = [
  "summarize",
  "summarize-short",
  "quiz",
  "flashcards",
  "definitions",
] as const;

export const STRUCTURED_AI_TOOL_NAMES = [
  "quiz",
  "flashcards",
  "definitions",
] as const;

export type ToolName = (typeof AI_TOOL_NAMES)[number];
export type StructuredToolName = (typeof STRUCTURED_AI_TOOL_NAMES)[number];

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

export function isToolName(tool: string): tool is ToolName {
  return AI_TOOL_NAMES.includes(tool as ToolName);
}

export function isStructuredToolName(tool: string): tool is StructuredToolName {
  return STRUCTURED_AI_TOOL_NAMES.includes(tool as StructuredToolName);
}

export function isToolData(
  tool: ToolName,
  value: unknown,
): value is ToolDataMap[ToolName] {
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

export function getToolLabel(tool: ToolName) {
  switch (tool) {
    case "summarize":
      return "Summary";
    case "summarize-short":
      return "Quick Summary";
    case "quiz":
      return "Quiz";
    case "flashcards":
      return "Flashcards";
    case "definitions":
      return "Definitions";
  }
}

export function getAiOutputPreview(result: ToolResult) {
  switch (result.tool) {
    case "summarize":
    case "summarize-short":
      return result.data.slice(0, 140);
    case "quiz":
      return `${result.data.length} questions ready to review.`;
    case "flashcards":
      return `${result.data.length} study cards saved for this material.`;
    case "definitions":
      return `${result.data.length} key terms extracted.`;
  }
}

function formatQuizForNote(questions: QuizQuestion[]) {
  return questions
    .map((question, index) => {
      const options = question.options.map((option) => `- ${option}`).join("\n");

      return [
        `${index + 1}. ${question.question}`,
        options,
        `Correct answer: ${question.correct}`,
        `Explanation: ${question.explanation}`,
      ].join("\n");
    })
    .join("\n\n");
}

function formatFlashcardsForNote(cards: Flashcard[]) {
  return cards
    .map(
      (card, index) =>
        `${index + 1}. Front: ${card.front}\nBack: ${card.back}`,
    )
    .join("\n\n");
}

function formatDefinitionsForNote(definitions: Definition[]) {
  return definitions
    .map((definition, index) => `${index + 1}. ${definition.term}: ${definition.definition}`)
    .join("\n");
}

export function formatAiToolOutputForNote(
  result: ToolResult & { createdAt?: string },
) {
  const dateLabel =
    "createdAt" in result && result.createdAt
      ? ` (${new Date(result.createdAt).toLocaleString()})`
      : "";

  const header = `[AI ${getToolLabel(result.tool)}${dateLabel}]`;

  switch (result.tool) {
    case "summarize":
    case "summarize-short":
      return `${header}\n${result.data}`;
    case "quiz":
      return `${header}\n${formatQuizForNote(result.data as QuizQuestion[])}`;
    case "flashcards":
      return `${header}\n${formatFlashcardsForNote(result.data as Flashcard[])}`;
    case "definitions":
      return `${header}\n${formatDefinitionsForNote(result.data as Definition[])}`;
  }
}
