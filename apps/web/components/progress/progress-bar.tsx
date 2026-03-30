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
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Project Progress</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {done} of {total} milestones completed
            {inProgress > 0 && <span className="text-amber-400"> &middot; {inProgress} in progress</span>}
          </p>
        </div>
        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
          {pct}%
        </span>
      </div>

      <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
