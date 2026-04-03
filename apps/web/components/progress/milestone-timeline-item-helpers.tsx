"use client";

import { toDateKey } from "../../lib/progress";
import type { Milestone } from "./types";

export const ITEM_SPRING = { type: "spring", stiffness: 260, damping: 24 } as const;
export const PANEL_EASE = [0.16, 1, 0.3, 1] as const;

export const statusConfig = {
  done: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    label: "Done",
    orb: "bg-emerald-200/70 dark:bg-emerald-400/10",
    line: "via-emerald-300/80 dark:via-emerald-300/45",
  },
  in_progress: {
    dot: "bg-amber-400",
    ring: "ring-amber-400/25",
    badge: "bg-amber-400/10 text-amber-700 dark:text-amber-300",
    label: "In Progress",
    orb: "bg-amber-200/70 dark:bg-amber-400/10",
    line: "via-amber-300/80 dark:via-amber-300/45",
  },
  not_started: {
    dot: "bg-slate-500",
    ring: "ring-slate-500/20",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    label: "Not Started",
    orb: "bg-slate-200/80 dark:bg-slate-400/10",
    line: "via-slate-300/80 dark:via-slate-400/40",
  },
  idea: {
    dot: "bg-cyan-400",
    ring: "ring-cyan-400/25",
    badge: "bg-cyan-400/10 text-cyan-700 dark:text-cyan-300",
    label: "Idea",
    orb: "bg-cyan-200/70 dark:bg-cyan-400/10",
    line: "via-cyan-300/80 dark:via-cyan-300/45",
  },
};

export function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m6.75 9.75 5.25 5.25 5.25-5.25" />
    </svg>
  );
}

export function formatTimelineDate(value: string | null) {
  const dateKey = toDateKey(value);
  if (!dateKey) return null;

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toTimelinePreviewText(value: string | null) {
  if (!value) return null;

  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (normalized.length <= 118) return normalized;
  return `${normalized.slice(0, 115).trim()}...`;
}

export function getTimelineMetaLabel(milestone: Milestone) {
  if (milestone.completedAt) {
    return `Completed ${formatTimelineDate(milestone.completedAt)}`;
  }

  if (milestone.dueDate) {
    return `Target ${formatTimelineDate(milestone.dueDate)}`;
  }

  return milestone.status === "done" ? "Wrapped up" : "Open for details";
}

export function getTimelineCardSurfaceClass(
  milestone: Milestone,
  isExpanded: boolean,
  isRevealed: boolean
) {
  if (isRevealed) {
    return "border-brand-300/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.96)_58%,rgba(232,244,255,0.94)_100%)] shadow-[0_22px_52px_rgba(99,102,241,0.16)] dark:border-brand-400/50 dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16)_0%,rgba(99,102,241,0)_26%),linear-gradient(160deg,rgba(17,24,39,0.97)_0%,rgba(10,15,32,0.96)_56%,rgba(6,10,22,0.98)_100%)]";
  }

  if (milestone.status === "done") {
    return "border-emerald-200/80 bg-[linear-gradient(160deg,rgba(236,253,245,0.95)_0%,rgba(255,255,255,0.94)_68%,rgba(240,253,250,0.92)_100%)] shadow-[0_16px_38px_rgba(16,185,129,0.08)] dark:border-emerald-400/20 dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12)_0%,rgba(16,185,129,0)_25%),linear-gradient(160deg,rgba(16,24,32,0.97)_0%,rgba(9,16,26,0.96)_58%,rgba(6,10,18,0.98)_100%)]";
  }

  if (isExpanded) {
    return "border-brand-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.97)_0%,rgba(248,250,255,0.95)_55%,rgba(238,242,255,0.92)_100%)] shadow-[0_20px_46px_rgba(15,23,42,0.10)] dark:border-brand-400/25 dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14)_0%,rgba(99,102,241,0)_26%),linear-gradient(160deg,rgba(15,24,42,0.97)_0%,rgba(9,17,34,0.96)_58%,rgba(6,10,24,0.98)_100%)]";
  }

  return "border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_58%,rgba(238,242,255,0.92)_100%)] shadow-[0_16px_36px_rgba(15,23,42,0.07)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10)_0%,rgba(34,211,238,0)_24%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(9,16,31,0.96)_58%,rgba(6,10,24,0.98)_100%)]";
}
