"use client";

import type { ProgressEvent } from "./types";

type UpcomingEventsPanelProps = {
  events: ProgressEvent[];
};

const TYPE_COLORS: Record<string, string> = {
  deadline: "bg-rose-400",
  exam: "bg-amber-400",
  milestone: "bg-violet-400",
  reminder: "bg-cyan-500",
  personal: "bg-emerald-400",
};

export function UpcomingEventsPanel({ events }: UpcomingEventsPanelProps) {
  const today = new Date().toISOString().slice(0, 10);
  const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const upcoming = events
    .filter((event) => event.date >= today && event.date <= weekLater)
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 5);

  return (
    <section className="rounded-xl border border-slate-200 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/60">
      <div>
        <p className="font-rubik text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Next 7 days
        </p>
        <h2 className="dashboard-panel-title mt-1 text-[1.45rem]">Coming Up</h2>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Nothing scheduled for the coming week.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {upcoming.map((event) => (
            <li
              key={event.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${TYPE_COLORS[event.type] ?? "bg-slate-400"}`}
              />
              <span className="font-rubik min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-100">
                {event.title}
              </span>
              <span className="font-rubik shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                {new Date(`${event.date}T00:00:00`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
