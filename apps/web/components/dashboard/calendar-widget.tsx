"use client";

import Link from "next/link";

type Event = {
  id: number;
  title: string;
  date: string;
  type: string;
};

type Props = {
  events: Event[];
};

const typeColors: Record<string, string> = {
  deadline: "bg-red-400",
  exam: "bg-orange-400",
  milestone: "bg-violet-400",
  reminder: "bg-blue-400",
  personal: "bg-emerald-400",
};

export function CalendarWidget({ events }: Props) {
  // Show upcoming events (today + next 7 days)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const upcoming = events
    .filter((e) => e.date >= todayStr && e.date <= weekLater)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <Link
      href="/calendar"
      className="block rounded-xl border border-slate-200 bg-white/80 px-4 py-3 hover:border-violet-300 transition-colors dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-violet-600"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Upcoming Events
      </p>

      {upcoming.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">No events this week</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {upcoming.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${typeColors[ev.type] ?? "bg-slate-400"}`}
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">
                {ev.title}
              </span>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(ev.date + "T00:00:00").toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
