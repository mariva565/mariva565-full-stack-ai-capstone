"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type Milestone = {
  id: number;
  title: string;
  status: string;
  dueDate: string | null;
};

type Props = {
  milestones: Milestone[];
};

export function ProgressWidget({ milestones }: Props) {
  const timelineMilestones = milestones.filter((milestone) => milestone.status !== "idea");
  const ideaCount = milestones.length - timelineMilestones.length;
  const total = timelineMilestones.length;
  const done = timelineMilestones.filter((milestone) => milestone.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const next = timelineMilestones.find(
    (milestone) => milestone.status === "in_progress" || milestone.status === "not_started"
  );

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Link
        href="/progress"
        className="group block rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.94)_60%,rgba(238,242,255,0.88)_100%)] px-4 py-4 shadow-[0_18px_40px_rgba(99,102,241,0.08)] backdrop-blur transition hover:border-brand-300/70 dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.94)_0%,rgba(8,16,38,0.94)_58%,rgba(5,12,28,0.98)_100%)] dark:hover:border-cyan-400/30 dark:hover:shadow-[0_24px_55px_rgba(6,182,212,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-400">
              Progress Board
            </p>
            <h2 className="dashboard-panel-title mt-1 text-2xl">
              Progress
            </h2>
          </div>
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-cyan-500 transition duration-300 group-hover:scale-105">
            {pct}%
          </span>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {next && (
          <p className="mt-2 truncate text-xs text-slate-400 dark:text-slate-400">
            Next: {next.title}
            {next.dueDate && (
              <span className="text-slate-400 dark:text-slate-500">
                {" "}
                &middot;{" "}
                {new Date(next.dueDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </p>
        )}

        {total === 0 && (
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">No milestones yet</p>
        )}

        {ideaCount > 0 && (
          <p className="mt-2 text-xs text-brand-700 dark:text-cyan-300">
            {ideaCount} {ideaCount === 1 ? "idea" : "ideas"} waiting in backlog
          </p>
        )}
      </Link>
    </motion.div>
  );
}
