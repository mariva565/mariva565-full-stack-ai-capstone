"use client";

type ProgressSummaryCardsProps = {
  total: number;
  done: number;
  active: number;
  overdue: number;
  ideas: number;
};

type SummaryCard = { label: string; value: number };

export function ProgressSummaryCards({
  total,
  done,
  active,
  overdue,
  ideas,
}: ProgressSummaryCardsProps) {
  const cards: SummaryCard[] = [
    { label: "Total", value: total },
    { label: "Done", value: done },
    { label: "Active", value: active },
    { label: "Overdue", value: overdue },
    { label: "Ideas", value: ideas },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p className="font-rubik text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <p className="font-rubik mt-1 text-[1.75rem] font-black tracking-tight bg-gradient-to-br from-brand-500 to-cyan-500 bg-clip-text text-transparent">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
