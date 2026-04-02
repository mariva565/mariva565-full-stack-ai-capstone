"use client";

type ProgressSummaryCardsProps = {
  total: number;
  done: number;
  active: number;
  overdue: number;
  ideas: number;
};

type SummaryCard = {
  label: string;
  value: number;
  valueClassName?: string;
};

export function ProgressSummaryCards({
  total,
  done,
  active,
  overdue,
  ideas,
}: ProgressSummaryCardsProps) {
  const cards: SummaryCard[] = [
    { label: "Total", value: total, valueClassName: "text-brand-700 dark:text-brand-100" },
    { label: "Done", value: done, valueClassName: "text-emerald-600 dark:text-emerald-300" },
    { label: "Active", value: active, valueClassName: "text-amber-600 dark:text-amber-300" },
    { label: "Overdue", value: overdue, valueClassName: "text-rose-600 dark:text-rose-300" },
    { label: "Ideas", value: ideas, valueClassName: "text-cyan-600 dark:text-cyan-300" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p
            className={`mt-1 text-[1.75rem] font-semibold text-slate-700 dark:text-slate-100 ${
              card.valueClassName ?? ""
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
