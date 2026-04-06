"use client";

import { AiToolResultContent } from "./ai-tool-result-content";
import type { SavedAiToolOutput } from "../../lib/ai-tool-outputs";
import { getAiOutputPreview, getToolLabel } from "../../lib/ai-tool-outputs";

type SavedAiOutputListProps = {
  outputs: SavedAiToolOutput[];
  onInsertIntoNote: (output: SavedAiToolOutput) => void;
};

export function SavedAiOutputList({
  outputs,
  onInsertIntoNote,
}: SavedAiOutputListProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            Saved AI Results
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            Reuse your generated study helpers
          </h3>
        </div>
        <span className="rounded-full border border-brand-200/80 bg-brand-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100">
          {outputs.length} saved
        </span>
      </div>

      {outputs.length === 0 ? (
        <div className="mt-4 rounded-[1.4rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No AI results saved yet
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Generate a summary, quiz, flashcards, or definitions and save the ones you want to keep under this material.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {outputs.map((output) => (
            <details
              key={output.id}
              className="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/55"
            >
              <summary className="cursor-pointer list-none px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
                      {getToolLabel(output.tool)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(output.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {getAiOutputPreview(output)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400">
                    Open
                  </span>
                </div>
              </summary>

              <div className="border-t border-slate-200/80 px-4 pb-4 pt-4 dark:border-slate-700">
                <div className="mb-3 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onInsertIntoNote(output)}
                    className="rounded-full border border-cyan-200/80 bg-cyan-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 transition hover:-translate-y-0.5 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100"
                  >
                    Insert into note
                  </button>
                </div>
                <AiToolResultContent result={output} />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
