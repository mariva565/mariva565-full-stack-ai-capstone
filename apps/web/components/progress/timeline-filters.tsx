"use client";

export type TimelineFilter =
  | "all"
  | "active"
  | "in_progress"
  | "today"
  | "next7"
  | "overdue"
  | "done";

type FilterOption = {
  id: TimelineFilter;
  label: string;
  count: number;
};

type TimelineFiltersProps = {
  value: TimelineFilter;
  options: FilterOption[];
  onChange: (value: TimelineFilter) => void;
};

export function TimelineFilters({ value, options, onChange }: TimelineFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selected
                  ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:border-brand-400 dark:bg-brand-500/20 dark:text-brand-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-brand-500/50 dark:hover:text-brand-300"
              }`}
            >
              {option.label}
              <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
