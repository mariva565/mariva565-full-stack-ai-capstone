"use client";

import { useState } from "react";

export type Milestone = {
  id: number;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "done" | "idea";
  dueDate: string | null;
  completedAt: string | null;
  orderIndex: number;
};

type Props = {
  milestones: Milestone[];
  onStatusChange: (id: number, status: Milestone["status"]) => void;
  onDelete: (id: number) => void;
};

const statusConfig = {
  done: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-400",
    label: "Done",
  },
  in_progress: {
    dot: "bg-amber-400",
    ring: "ring-amber-400/30",
    badge: "bg-amber-400/10 text-amber-400",
    label: "In Progress",
  },
  not_started: {
    dot: "bg-slate-500",
    ring: "ring-slate-500/30",
    badge: "bg-slate-500/10 text-slate-400",
    label: "Not Started",
  },
  idea: {
    dot: "bg-cyan-400",
    ring: "ring-cyan-400/30",
    badge: "bg-cyan-400/10 text-cyan-400",
    label: "Idea",
  },
};

const nextStatus: Record<Milestone["status"], Milestone["status"]> = {
  idea: "not_started",
  not_started: "in_progress",
  in_progress: "done",
  done: "not_started",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MilestoneTimeline({ milestones, onStatusChange, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (milestones.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-12 text-center">
        <p className="text-slate-400">No milestones yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="relative ml-4">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-700" />

      <ul className="space-y-1">
        {milestones.map((ms) => {
          const cfg = statusConfig[ms.status];
          const isExpanded = expandedId === ms.id;
          const isOverdue =
            ms.status !== "done" &&
            ms.dueDate &&
            new Date(ms.dueDate) < new Date();

          return (
            <li key={ms.id} className="relative pl-10">
              {/* Status dot */}
              <button
                onClick={() => onStatusChange(ms.id, nextStatus[ms.status])}
                className={`absolute left-0.5 top-3 h-5 w-5 rounded-full ${cfg.dot} ring-4 ${cfg.ring} transition-all hover:scale-110 cursor-pointer`}
                title={`Click to change to "${nextStatus[ms.status].replace("_", " ")}"`}
              />

              <div
                className={`rounded-xl border px-4 py-3 transition-colors cursor-pointer ${
                  ms.status === "done"
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                }`}
                onClick={() => setExpandedId(isExpanded ? null : ms.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`font-medium ${
                      ms.status === "done" ? "text-slate-400 line-through" : "text-white"
                    }`}
                  >
                    {ms.title}
                  </h3>

                  <div className="flex items-center gap-2 shrink-0">
                    {ms.dueDate && (
                      <span
                        className={`text-xs ${
                          isOverdue ? "text-red-400 font-semibold" : "text-slate-500"
                        }`}
                      >
                        {isOverdue && "! "}
                        {formatDate(ms.dueDate)}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 border-t border-slate-700 pt-3">
                    {ms.description && (
                      <p className="text-sm text-slate-400 mb-3">{ms.description}</p>
                    )}
                    {ms.completedAt && (
                      <p className="text-xs text-slate-500 mb-3">
                        Completed: {formatDate(ms.completedAt)}
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ms.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete milestone
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
