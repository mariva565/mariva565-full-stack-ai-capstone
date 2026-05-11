"use client";

import { useState } from "react";

import { AiToolResultContent } from "./ai-tool-result-content";
import { SavedAiOutputList } from "./saved-ai-output-list";
import type {
  SavedAiToolOutput,
  ToolName,
  ToolResult,
} from "../../lib/ai-tool-outputs";
import {
  getToolLabel,
  isSavedAiToolOutput,
  isToolData,
} from "../../lib/ai-tool-outputs";
import { isExtractableFileUrl } from "../../lib/materials";

type AiToolsPanelProps = {
  content: string;
  materialId: number;
  fileUrl: string | null;
  savedOutputs: SavedAiToolOutput[];
  onOutputSaved: (output: SavedAiToolOutput) => void;
  onInsertIntoNote: (result: ToolResult | SavedAiToolOutput) => void;
  onExtractedText: (text: string) => void;
};

const TOOLS: { name: ToolName; label: string; icon: string }[] = [
  {
    name: "summarize",
    label: "Summarize",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    name: "flashcards",
    label: "Flashcards",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    name: "quiz",
    label: "Quiz",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    name: "definitions",
    label: "Definitions",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
];

function buildToolResult(tool: ToolName, data: unknown): ToolResult | null {
  if (!isToolData(tool, data)) {
    return null;
  }

  return { tool, data } as ToolResult;
}

export function AiToolsPanel({
  content,
  materialId,
  fileUrl,
  savedOutputs,
  onOutputSaved,
  onInsertIntoNote,
  onExtractedText,
}: AiToolsPanelProps) {
  const hasSourceContent = content.trim().length > 0;
  const canExtract = isExtractableFileUrl(fileUrl);
  const [loading, setLoading] = useState<ToolName | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [extracting, setExtracting] = useState(false);

  async function runTool(tool: ToolName) {
    setLoading(tool);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, content }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || `Error ${response.status}`);
      }

      const payload = await response.json();
      const nextResult = buildToolResult(tool, payload?.data);
      if (!nextResult) {
        throw new Error("AI returned an unexpected format. Please try again.");
      }

      setResult(nextResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleSaveResult() {
    if (!result) return;

    setSaveBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/materials/${materialId}/ai-outputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || `Error ${response.status}`);
      }

      const payload = await response.json();
      if (!isSavedAiToolOutput(payload?.output)) {
        throw new Error("AI result was saved, but the response format was invalid.");
      }

      onOutputSaved(payload.output);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save AI result.",
      );
    } finally {
      setSaveBusy(false);
    }
  }

  async function handleExtractText() {
    setExtracting(true);
    setError(null);

    try {
      const response = await fetch(`/api/materials/${materialId}/extract-text`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || `Error ${response.status}`);
      }

      const payload = await response.json();
      if (typeof payload?.text !== "string" || !payload.text.trim()) {
        throw new Error("Could not extract any text from the file.");
      }

      onExtractedText(payload.text);
    } catch (extractError) {
      setError(
        extractError instanceof Error
          ? extractError.message
          : "Failed to extract text from file",
      );
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20">
          <svg
            className="h-4 w-4 text-brand-600 dark:text-brand-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          AI Study Tools
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOOLS.map((tool) => (
          <button
            key={tool.name}
            type="button"
            disabled={loading !== null || !hasSourceContent}
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
              <svg
                className="h-6 w-6 transition group-hover:scale-110"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
              </svg>
            )}
            {tool.label}
          </button>
        ))}
      </div>

      {!hasSourceContent && canExtract ? (
        <div className="rounded-xl border border-dashed border-brand-300/80 bg-brand-50/80 px-4 py-3 dark:border-brand-700 dark:bg-brand-900/20">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            This material has an attached document. Extract its text to use it with AI tools or as notes.
          </p>
          <button
            type="button"
            disabled={extracting}
            onClick={handleExtractText}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {extracting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )}
            {extracting ? "Extracting..." : "Extract text from file"}
          </button>
        </div>
      ) : !hasSourceContent ? (
        <div className="rounded-xl border border-dashed border-slate-300/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          Add or restore some material notes if you want to generate new AI results. Your saved AI entries stay available below.
        </div>
      ) : canExtract ? (
        <button
          type="button"
          disabled={extracting}
          onClick={handleExtractText}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/90 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:-translate-y-0.5 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {extracting ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-400/40 border-t-brand-600" />
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          )}
          {extracting ? "Extracting..." : "Extract text from file"}
        </button>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3 rounded-[1.75rem] border border-brand-200/40 bg-white/92 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur dark:border-brand-400/10 dark:bg-slate-950/55">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Current AI Result
              </p>
              <h4 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {getToolLabel(result.tool)}
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saveBusy}
                onClick={handleSaveResult}
                className="rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveBusy ? "Saving..." : "Save result"}
              </button>
              <button
                type="button"
                onClick={() => onInsertIntoNote(result)}
                className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 transition hover:-translate-y-0.5 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100"
              >
                Insert into note
              </button>
            </div>
          </div>

          <AiToolResultContent result={result} />
        </div>
      ) : null}

      <SavedAiOutputList
        outputs={savedOutputs}
        onInsertIntoNote={onInsertIntoNote}
      />
    </div>
  );
}
