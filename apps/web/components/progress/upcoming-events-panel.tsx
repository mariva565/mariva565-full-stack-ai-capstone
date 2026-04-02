"use client";

import Link from "next/link";

type ProgressEvent = {
  id: number;
  title: string;
  date: string;
  type: string;
  color: string | null;
};

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Calendar
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Upcoming events for the next 7 days.
          </p>
        </div>

        <Link
          href="/calendar"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          Open calendar
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          No events in the next week.
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
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900 dark:text-white">
                {event.title}
              </span>
              <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
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
