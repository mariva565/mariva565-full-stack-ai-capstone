"use client";

import { motion } from "framer-motion";
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
  deadline: "bg-rose-400",
  exam: "bg-brand-400",
  milestone: "bg-brand-500",
  reminder: "bg-cyan-500",
  personal: "bg-slate-400",
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
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Link
        href="/calendar"
        className="group block rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.94)_60%,rgba(224,242,254,0.88)_100%)] px-4 py-4 shadow-[0_18px_40px_rgba(99,102,241,0.08)] backdrop-blur transition hover:border-brand-300/60 dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(14,24,48,0.94)_0%,rgba(7,20,43,0.95)_58%,rgba(4,20,43,0.98)_100%)] dark:hover:border-cyan-400/30 dark:hover:shadow-[0_24px_55px_rgba(6,182,212,0.08)]"
      >
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">
          Calendar Pulse
        </p>
        <h2 className="dashboard-panel-title mt-1 text-2xl">
          Upcoming Events
        </h2>

        {upcoming.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">No events this week</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/88 px-2.5 py-2 transition duration-300 group-hover:translate-x-0.5 dark:border-slate-800/80 dark:bg-slate-950/55"
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${typeColors[ev.type] ?? "bg-slate-400"}`}
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                  {ev.title}
                </span>
                <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-400">
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
    </motion.div>
  );
}
