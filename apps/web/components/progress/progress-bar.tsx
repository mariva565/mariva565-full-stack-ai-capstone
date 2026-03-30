"use client";

import type { Milestone } from "./milestone-timeline";

type Props = {
  milestones: Milestone[];
};

export function ProgressBar({ milestones }: Props) {
  const total = milestones.length;
  const done = milestones.filter((m) => m.status === "done").length;
  const inProgress = milestones.filter((m) => m.status === "in_progress").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project Progress</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {done} of {total} milestones completed
            {inProgress > 0 && (
              <span className="text-amber-600 dark:text-amber-300">
                {" "}
                &middot; {inProgress} in progress
              </span>
            )}
          </p>
        </div>
        <span className="bg-gradient-to-r from-brand-500 to-cyan-500 bg-clip-text text-3xl font-bold text-transparent">
          {pct}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
