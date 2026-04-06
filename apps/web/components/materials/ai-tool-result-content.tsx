"use client";

import { useState } from "react";

import type {
  Definition,
  Flashcard,
  QuizQuestion,
  ToolResult,
} from "../../lib/ai-tool-outputs";

type AiToolResultContentProps = {
  result: ToolResult;
};

export function AiToolResultContent({ result }: AiToolResultContentProps) {
  switch (result.tool) {
    case "summarize":
    case "summarize-short":
      return <SummaryResult text={result.data} />;
    case "quiz":
      return <QuizResult questions={result.data} />;
    case "flashcards":
      return <FlashcardsResult cards={result.data} />;
    case "definitions":
      return <DefinitionsResult definitions={result.data} />;
  }
}

function SummaryResult({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 px-5 py-4 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        Summary
      </h4>
      <div className="whitespace-pre-wrap">{text}</div>
    </div>
  );
}

function QuizResult({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const score = questions.reduce(
    (sum, question, index) => sum + (answers[index] === question.correct ? 1 : 0),
    0,
  );
  const allAnswered = Object.keys(answers).length === questions.length;

  function selectAnswer(questionIndex: number, letter: string) {
    if (showResults) return;
    setAnswers((current) => ({ ...current, [questionIndex]: letter }));
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        Quiz - {questions.length} questions
      </h4>

      {questions.map((question, questionIndex) => (
        <div
          key={`${questionIndex}-${question.question}`}
          className="rounded-xl border border-slate-200/80 bg-white/90 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/50"
        >
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {questionIndex + 1}. {question.question}
          </p>
          <div className="mt-3 space-y-2">
            {question.options.map((option) => {
              const letter = option.charAt(0);
              const isSelected = answers[questionIndex] === letter;
              const isCorrect = letter === question.correct;

              let optionStyle =
                "border-slate-200 bg-white/80 text-slate-700 hover:border-brand-300 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300";

              if (showResults && isCorrect) {
                optionStyle =
                  "border-green-300 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300";
              } else if (showResults && isSelected && !isCorrect) {
                optionStyle =
                  "border-red-300 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300";
              } else if (isSelected) {
                optionStyle =
                  "border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-500 dark:bg-brand-500/20 dark:text-brand-200";
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectAnswer(questionIndex, letter)}
                  className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition ${optionStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {showResults && answers[questionIndex] !== question.correct ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {question.explanation}
            </p>
          ) : null}
        </div>
      ))}

      {showResults ? (
        <div
          className={`rounded-xl px-5 py-4 text-center text-lg font-bold ${
            score === questions.length
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
          }`}
        >
          Score: {score} / {questions.length}
        </div>
      ) : (
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => setShowResults(true)}
          className="w-full rounded-xl bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {allAnswered
            ? "Check answers"
            : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}
    </div>
  );
}

function FlashcardsResult({
  cards,
}: {
  cards: Flashcard[];
}) {
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
        Flashcards - {currentIndex + 1} of {cards.length}
      </h4>

      <div className="mt-3 [perspective:800px]">
        <button
          type="button"
          onClick={() => setFlipped((current) => !current)}
          className="relative h-48 w-full cursor-pointer [transform-style:preserve-3d] transition-transform duration-500"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-brand-200/80 bg-white/95 px-6 text-center text-sm font-medium text-slate-800 shadow-md [backface-visibility:hidden] dark:border-brand-500/20 dark:bg-slate-900/80 dark:text-slate-200">
            <div>
              <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">
                Question
              </p>
              <p>{card.front}</p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-cyan-200/80 bg-cyan-50/90 px-6 text-center text-sm font-medium text-slate-800 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-cyan-500/20 dark:bg-cyan-900/30 dark:text-cyan-100">
            <div>
              <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">
                Answer
              </p>
              <p>{card.back}</p>
            </div>
          </div>
        </button>
      </div>

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

      <p className="mt-2 text-center text-[0.65rem] text-slate-400 dark:text-slate-500">
        Click the card to flip it
      </p>
    </div>
  );
}

function DefinitionsResult({
  definitions,
}: {
  definitions: Definition[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-300">
        Definitions - {definitions.length} terms
      </h4>
      <div className="space-y-2">
        {definitions.map((definition, index) => (
          <div
            key={`${index}-${definition.term}`}
            className="rounded-xl border border-slate-200/80 bg-white/90 px-5 py-3 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p className="text-sm font-bold text-slate-900 dark:text-white">{definition.term}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {definition.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
