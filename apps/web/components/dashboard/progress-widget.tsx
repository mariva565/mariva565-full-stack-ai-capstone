"use client";

import Link from "next/link";

type Milestone = {
  id: number;
  title: string;
  status: string;
  dueDate: string | null;
};

type Props = {
  milestones: Milestone[];
};

export function ProgressWidget({ milestones }: Props) {
  const total = milestones.length;
  const done = milestones.filter((m) => m.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const next = milestones.find((m) => m.status === "in_progress" || m.status === "not_started");

  return (
    <Link
      href="/progress"
      className="block rounded-xl border border-slate-200 bg-white/80 px-4 py-3 hover:border-violet-300 transition-colors dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-violet-600"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Progress
        </p>
        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
          {pct}%
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {next && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          Next: {next.title}
          {next.dueDate && (
            <span className="text-slate-400 dark:text-slate-500">
              {" "}
              &middot;{" "}
              {new Date(next.dueDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </p>
      )}

      {total === 0 && (
        <p className="mt-2 text-xs text-slate-400">No milestones yet</p>
      )}
    </Link>
  );
}
