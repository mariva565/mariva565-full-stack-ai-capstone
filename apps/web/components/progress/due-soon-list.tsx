"use client";

import { DeadlinePill } from "./deadline-pill";
import type { Milestone } from "./types";
import { classifyMilestoneDueDate, formatMilestoneDueDate } from "../../lib/progress";

type DueSoonListProps = {
  milestones: Milestone[];
};

export function DueSoonList({ milestones }: DueSoonListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/60">
      <p className="font-rubik text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        Milestones
      </p>
      <h2 className="dashboard-panel-title mt-1 text-[1.45rem]">Due Soon</h2>

      {milestones.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No upcoming deadlines yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {milestones.map((milestone) => {
            if (!milestone.dueDate) return null;

            const category = classifyMilestoneDueDate(milestone);
            const dueLabel = formatMilestoneDueDate(milestone.dueDate) || "date";
            const label =
              category === "overdue"
                ? `Overdue ${dueLabel}`
                : category === "today"
                  ? `Today ${dueLabel}`
                  : category === "next7"
                    ? `Next 7 days ${dueLabel}`
                    : `Due ${dueLabel}`;

            return (
              <li
                key={milestone.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <p className="font-rubik truncate text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-100">
                  {milestone.title}
                </p>
                <div className="mt-1">
                  <DeadlinePill category={category} label={label} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
