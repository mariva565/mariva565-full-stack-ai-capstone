"use client";

import type { DueDateCategory } from "../../lib/progress";

type DeadlinePillProps = {
  category: DueDateCategory;
  label: string;
};

const CATEGORY_STYLES: Record<DueDateCategory, string> = {
  none: "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300",
  upcoming:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300",
  next7:
    "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-300",
  today:
    "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-300",
  overdue:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-300",
};

export function DeadlinePill({ category, label }: DeadlinePillProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[category]}`}
    >
      {label}
    </span>
  );
}
