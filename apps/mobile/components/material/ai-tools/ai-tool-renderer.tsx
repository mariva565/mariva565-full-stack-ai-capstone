import { View } from "react-native";
import { SummaryView } from "./summary-view";
import { FlashcardsView } from "./flashcards-view";
import { QuizView } from "./quiz-view";
import { DefinitionsView } from "./definitions-view";
import type { ToolResult } from "../../../lib/studyhub-types";

export function AiToolRenderer({ result }: { result: ToolResult }) {
  switch (result.tool) {
    case "summarize":
    case "summarize-short":
      return <SummaryView text={result.data as string} />;
    case "flashcards":
      return <FlashcardsView cards={result.data as any} />;
    case "quiz":
      return <QuizView questions={result.data as any} />;
    case "definitions":
      return <DefinitionsView definitions={result.data as any} />;
    default:
      return null;
  }
}
