"use client";

import type { Milestone } from "./types";

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
          <p className="font-poppins text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Timeline
          </p>
          <h2 className="dashboard-panel-title mt-1 text-[1.65rem]">Project Progress</h2>
          <p className="font-poppins mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {done} of {total} milestones completed
            {inProgress > 0 && (
              <span className="text-amber-600 dark:text-amber-300">
                {" "}
                &middot; {inProgress} in progress
              </span>
            )}
          </p>
        </div>
        <span className="font-poppins bg-gradient-to-r from-brand-500 to-cyan-500 bg-clip-text text-3xl font-black tracking-tight text-transparent">
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
