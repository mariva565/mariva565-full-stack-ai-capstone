"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { readErrorMessage } from "../../lib/http";
import { DashboardActionButton } from "../dashboard/dashboard-controls";
import { DashboardPageShell } from "../dashboard/dashboard-page-shell";
import { ZiksiMascot } from "../ui/ziksi-mascot";

type FinderResult = {
  id: number;
  title: string;
  moduleTitle: string;
  courseTitle: string;
  snippet: string;
  score: number;
  url: string;
};

type FinderTurn = {
  id: string;
  query: string;
  reply: string;
  mode: "template" | "gemini";
  results: FinderResult[];
};

type FinderApiResponse = {
  reply: string;
  mode: "template" | "gemini";
  results: FinderResult[];
};

const STARTER_QUERIES = [
  "Намери ми в кой материал пише за TypeScript",
  "Някъде из материалите съм си записала промптове за красив интерфейс",
  "Find my notes about JWT role checks",
];

function ResultCard({ result }: { result: FinderResult }) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-cyan-400/15 dark:bg-slate-950/55">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {result.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {result.courseTitle} / {result.moduleTitle}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Score {result.score}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {result.snippet}
      </p>

      <Link
        href={result.url}
        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-cyan-300 dark:hover:text-cyan-200"
      >
        Open material
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

function FinderConversationTurn({ turn }: { turn: FinderTurn }) {
  return (
    <div className="space-y-3">
      <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(99,102,241,0.2)]">
        {turn.query}
      </div>

      <div className="max-w-[96%] rounded-2xl rounded-bl-md border border-slate-200/80 bg-white/95 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-cyan-400/15 dark:bg-slate-950/70 dark:text-slate-200">
        <p className="whitespace-pre-line">{turn.reply}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
          {turn.mode === "gemini" ? "Gemini phrasing" : "Template reply"}
        </p>
      </div>

      {turn.results.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {turn.results.map((result) => (
            <ResultCard key={`${turn.id}-${result.id}`} result={result} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center dark:border-cyan-400/20 dark:bg-slate-900/35">
      <ZiksiMascot src="/assets/v1/ziksi-observing.png" size="md" className="mx-auto mb-4" />
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Ask where you saved something
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        The assistant searches only your own materials by title, tags, and content.
      </p>
    </div>
  );
}

export function MaterialFinderClient({ userName }: { userName: string }) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<FinderTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function sendQuery(rawQuery: string) {
    const query = rawQuery.trim();
    if (!query || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/assistant/material-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Material finder request failed."));
      }

      const payload = (await response.json()) as FinderApiResponse;
      const nextTurn: FinderTurn = {
        id: `${Date.now()}-${Math.random()}`,
        query,
        reply: payload.reply,
        mode: payload.mode,
        results: payload.results ?? [],
      };

      setTurns((current) => [...current, nextTurn]);
      setInput("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Material finder request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuery(input);
  }

  return (
    <DashboardPageShell>
      <section className="rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(140deg,rgba(255,255,255,0.95)_0%,rgba(238,242,255,0.9)_60%,rgba(236,254,255,0.85)_100%)] p-5 shadow-[0_24px_65px_rgba(15,23,42,0.12)] dark:border-cyan-400/15 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.13)_0%,rgba(148,163,184,0.07)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.95)_0%,rgba(8,16,38,0.94)_58%,rgba(5,12,28,0.96)_100%)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="dashboard-script-title text-4xl">Material Finder</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {`Hi ${userName}. Ask naturally and I will search your own materials first.`}
            </p>
          </div>
          <DashboardActionButton href="/dashboard" size="sm" variant="secondary">
            Back to Dashboard
          </DashboardActionButton>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STARTER_QUERIES.map((starter) => (
            <button
              key={starter}
              type="button"
              onClick={() => {
                setInput(starter);
              }}
              className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-cyan-400/20 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-cyan-300/40 dark:hover:text-cyan-200"
            >
              {starter}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {turns.length === 0 ? <EmptyState /> : null}
          {turns.map((turn) => (
            <FinderConversationTurn key={turn.id} turn={turn} />
          ))}
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/10 dark:text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            rows={3}
            placeholder="Например: Намери ми материала за TypeScript generics..."
            className="w-full resize-none rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-cyan-400/20 dark:bg-slate-950/65 dark:text-slate-200 dark:focus:border-cyan-300/40 dark:focus:ring-cyan-500/20"
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quota-safe mode: search first, Gemini only when several matches need phrasing.
            </p>
            <button
              type="submit"
              disabled={isLoading || input.trim().length < 2}
              className="rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(99,102,241,0.3)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLoading ? "Searching..." : "Find material"}
            </button>
          </div>
        </form>
      </section>
    </DashboardPageShell>
  );
}
