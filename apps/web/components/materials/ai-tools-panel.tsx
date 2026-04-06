"use client";

import { useState } from "react";

type ToolName = "summarize" | "summarize-short" | "quiz" | "flashcards" | "definitions";

type QuizQuestion = {
  question: string;
  options: string[];
  correct: string;
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

type ToolResult =
  | { tool: "summarize" | "summarize-short"; data: string }
  | { tool: "quiz"; data: QuizQuestion[] }
  | { tool: "flashcards"; data: Flashcard[] }
  | { tool: "definitions"; data: Definition[] };

type AiToolsPanelProps = {
  content: string;
};

const TOOLS: { name: ToolName; label: string; icon: string }[] = [
  { name: "summarize", label: "Summarize", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { name: "flashcards", label: "Flashcards", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { name: "quiz", label: "Quiz", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { name: "definitions", label: "Definitions", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
];

export function AiToolsPanel({ content }: AiToolsPanelProps) {
  const [loading, setLoading] = useState<ToolName | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTool(tool: ToolName) {
    setLoading(tool);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Error ${res.status}`);
      }

      const data = await res.json();
      setResult({ tool, data: data.data } as ToolResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
          <svg className="h-4 w-4 text-brand-600 dark:text-brand-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          AI Study Tools
        </h3>
      </div>

      {/* Tool buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOOLS.map((tool) => (
          <button
            key={tool.name}
            type="button"
            disabled={loading !== null}
            onClick={() => runTool(tool.name)}
            className={`group flex flex-col items-center gap-2.5 rounded-2xl px-3 py-5 text-xs font-semibold shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
              loading === tool.name
                ? "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_8px_24px_rgba(99,102,241,0.3)]"
                : "border border-slate-200/80 bg-white/90 text-slate-600 hover:border-transparent hover:bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] hover:text-white hover:shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-transparent dark:hover:bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] dark:hover:text-white"
            }`}
          >
            {loading === tool.name ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg className="h-6 w-6 transition group-hover:scale-110" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
              </svg>
            )}
            {tool.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {/* Results */}
      {result ? (
        <div className="mt-4">
          {result.tool === "summarize" || result.tool === "summarize-short" ? (
            <SummaryResult text={result.data as string} />
          ) : null}
          {result.tool === "quiz" ? (
            <QuizResult questions={result.data as QuizQuestion[]} />
          ) : null}
          {result.tool === "flashcards" ? (
            <FlashcardsResult cards={result.data as Flashcard[]} />
          ) : null}
          {result.tool === "definitions" ? (
            <DefinitionsResult definitions={result.data as Definition[]} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Result sub-components ---------- */

function SummaryResult({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 px-5 py-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">Summary</h4>
      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
}

function QuizResult({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const score = questions.reduce(
    (sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0),
    0
  );
  const allAnswered = Object.keys(answers).length === questions.length;

  function selectAnswer(qIndex: number, letter: string) {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: letter }));
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        Quiz — {questions.length} questions
      </h4>

      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-slate-200/80 bg-white/90 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt) => {
              const letter = opt.charAt(0);
              const isSelected = answers[qi] === letter;
              const isCorrect = letter === q.correct;

              let optionStyle = "border-slate-200 bg-white/80 text-slate-700 hover:border-brand-300 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300";
              if (showResults && isCorrect) {
                optionStyle = "border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300";
              } else if (showResults && isSelected && !isCorrect) {
                optionStyle = "border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300";
              } else if (isSelected) {
                optionStyle = "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-500/20 dark:text-brand-200";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => selectAnswer(qi, letter)}
                  className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition ${optionStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {showResults && answers[qi] !== q.correct ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {q.explanation}
            </p>
          ) : null}
        </div>
      ))}

      {showResults ? (
        <div className={`rounded-xl px-5 py-4 text-center text-lg font-bold ${
          score === questions.length
            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
        }`}>
          Score: {score} / {questions.length}
        </div>
      ) : (
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => setShowResults(true)}
          className="w-full rounded-xl bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered ? "Check answers" : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}
    </div>
  );
}

function FlashcardsResult({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[currentIndex];
  if (!card) return null;

  function goTo(index: number) {
    setFlipped(false);
    setCurrentIndex(index);
  }

  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        Flashcards — {currentIndex + 1} of {cards.length}
      </h4>

      {/* Card */}
      <div className="mt-3 [perspective:800px]">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative h-48 w-full cursor-pointer [transform-style:preserve-3d] transition-transform duration-500"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-brand-200/80 bg-white/95 px-6 text-center text-sm font-medium text-slate-800 shadow-md [backface-visibility:hidden] dark:border-brand-500/20 dark:bg-slate-900/80 dark:text-slate-200">
            <div>
              <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">Question</p>
              <p>{card.front}</p>
            </div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-cyan-200/80 bg-cyan-50/90 px-6 text-center text-sm font-medium text-slate-800 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-cyan-500/20 dark:bg-cyan-900/30 dark:text-cyan-100">
            <div>
              <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">Answer</p>
              <p>{card.back}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
          className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
        >
          Previous
        </button>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {currentIndex + 1} / {cards.length}
        </span>
        <button
          type="button"
          disabled={currentIndex === cards.length - 1}
          onClick={() => goTo(currentIndex + 1)}
          className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
        >
          Next
        </button>
      </div>

      {/* Click hint */}
      <p className="mt-2 text-center text-[0.65rem] text-slate-400 dark:text-slate-500">
        Click the card to flip it
      </p>
    </div>
  );
}

function DefinitionsResult({ definitions }: { definitions: Definition[] }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        Definitions — {definitions.length} terms
      </h4>
      <div className="space-y-2">
        {definitions.map((def, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 bg-white/90 px-5 py-3 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-sm font-bold text-slate-900 dark:text-white">{def.term}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{def.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
