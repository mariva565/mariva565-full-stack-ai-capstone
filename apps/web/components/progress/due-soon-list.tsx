"use client";

import { DeadlinePill } from "./deadline-pill";
import type { Milestone } from "./milestone-timeline";
import { classifyMilestoneDueDate, formatMilestoneDueDate } from "../../lib/progress";

type DueSoonListProps = {
  milestones: Milestone[];
};

export function DueSoonList({ milestones }: DueSoonListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/60">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Due Soon
      </h2>

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
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
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
