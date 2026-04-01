"use client";

import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import {
  DashboardActionButton,
  DashboardPill,
} from "./dashboard-controls";

type Props = {
  ideaCount: number;
  busy: boolean;
  onAdd: (title: string, description: string) => Promise<boolean>;
};

export function QuickIdeaCapture({ ideaCount, busy, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) {
      return;
    }

    const saved = await onAdd(trimmedTitle, trimmedDescription);
    if (!saved) {
      return;
    }

    setTitle("");
    setDescription("");
  }

  return (
    <motion.section
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.94)_60%,rgba(236,254,255,0.88)_100%)] p-4 shadow-[0_18px_40px_rgba(6,182,212,0.09)] backdrop-blur dark:border-cyan-400/15 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(12,24,43,0.94)_0%,rgba(5,16,32,0.95)_58%,rgba(3,14,29,0.98)_100%)] dark:shadow-[0_24px_55px_rgba(2,12,27,0.58),0_0_28px_rgba(6,182,212,0.05)]"
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="pointer-events-none absolute -right-8 top-[-1rem] hidden h-24 w-24 rounded-full bg-white/10 blur-3xl dark:block" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
            Quick Idea Capture
          </p>
          <h2 className="dashboard-panel-title mt-1 text-2xl">
            Add to backlog from here
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Save the idea now and sort it on the full progress board later.
          </p>
        </div>
        <DashboardPill tone="brand" size="sm" className="hover:scale-105">
          {ideaCount}
        </DashboardPill>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Example: Add study streak widget"
          className="w-full rounded-[1rem] border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:border-brand-500 focus:outline-none dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Optional note for future you"
          className="w-full resize-none rounded-[1rem] border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:border-brand-500 focus:outline-none dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <DashboardActionButton
            href="/progress#ideas-backlog"
            variant="secondary"
          >
            Open full backlog
          </DashboardActionButton>

          <DashboardActionButton
            type="submit"
            disabled={busy || !title.trim()}
            variant="primary"
          >
            {busy ? "Saving..." : "Add to backlog"}
          </DashboardActionButton>
        </div>
      </form>
    </motion.section>
  );
}
