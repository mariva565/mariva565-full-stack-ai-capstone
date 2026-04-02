"use client";

import { useState } from "react";
import { DeadlinePill } from "./deadline-pill";
import { MilestoneEditor } from "./milestone-editor";
import {
  classifyMilestoneDueDate,
  formatMilestoneDueDate,
  toDateKey,
} from "../../lib/progress";

export type Milestone = {
  id: number;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "done" | "idea";
  dueDate: string | null;
  completedAt: string | null;
  orderIndex: number;
};

export type MilestoneUpdate = {
  title: string;
  description: string;
  dueDate: string | null;
};

type MoveDirection = "up" | "down";

type Props = {
  milestones: Milestone[];
  onStatusChange: (id: number, status: Milestone["status"]) => void;
  onUpdate: (id: number, update: MilestoneUpdate) => Promise<boolean>;
  onMove: (
    id: number,
    direction: MoveDirection,
    visibleIds: number[]
  ) => Promise<void>;
  onDelete: (id: number) => void;
  busyId?: number | null;
  emptyMessage?: string;
};

const statusConfig = {
  done: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    label: "Done",
  },
  in_progress: {
    dot: "bg-amber-400",
    ring: "ring-amber-400/30",
    badge: "bg-amber-400/10 text-amber-700 dark:text-amber-300",
    label: "In Progress",
  },
  not_started: {
    dot: "bg-slate-500",
    ring: "ring-slate-500/30",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    label: "Not Started",
  },
  idea: {
    dot: "bg-cyan-400",
    ring: "ring-cyan-400/30",
    badge: "bg-cyan-400/10 text-cyan-700 dark:text-cyan-300",
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

function toDateInputValue(value: string | null) {
  return toDateKey(value) ?? "";
}

export function MilestoneTimeline({
  milestones,
  onStatusChange,
  onUpdate,
  onMove,
  onDelete,
  busyId = null,
  emptyMessage = "No milestones yet. Add your first one above.",
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");

  const orderedIds = milestones.map((item) => item.id);

  function startEdit(milestone: Milestone) {
    setExpandedId(milestone.id);
    setEditingId(milestone.id);
    setDraftTitle(milestone.title);
    setDraftDescription(milestone.description ?? "");
    setDraftDueDate(toDateInputValue(milestone.dueDate));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(milestoneId: number) {
    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) return;

    const saved = await onUpdate(milestoneId, {
      title: trimmedTitle,
      description: draftDescription.trim(),
      dueDate: draftDueDate || null,
    });

    if (saved) {
      setEditingId(null);
    }
  }

  if (milestones.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative ml-4">
      <div className="absolute bottom-2 left-3 top-2 w-0.5 bg-slate-200 dark:bg-slate-700" />

      <ul className="space-y-1">
        {milestones.map((milestone, index) => {
          const cfg = statusConfig[milestone.status];
          const isExpanded = expandedId === milestone.id;
          const isEditing = editingId === milestone.id;
          const isBusy = busyId === milestone.id;
          const canMoveUp = index > 0;
          const canMoveDown = index < milestones.length - 1;

          const dueCategory = classifyMilestoneDueDate(milestone);
          const dueDateLabel = formatMilestoneDueDate(milestone.dueDate) || "date";
          const duePillLabel =
            dueCategory === "overdue"
              ? `Overdue ${dueDateLabel}`
              : dueCategory === "today"
                ? `Today ${dueDateLabel}`
                : dueCategory === "next7"
                  ? `Next 7 days ${dueDateLabel}`
                  : `Due ${dueDateLabel}`;

          return (
            <li key={milestone.id} className="relative pl-10">
              <button
                onClick={() => onStatusChange(milestone.id, nextStatus[milestone.status])}
                className={`absolute left-0.5 top-3 h-5 w-5 cursor-pointer rounded-full ${cfg.dot} ring-4 ${cfg.ring} transition-all hover:scale-110`}
                title={`Click to change to "${nextStatus[milestone.status].replace("_", " ")}"`}
                disabled={isBusy}
              />

              <div
                className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                  milestone.status === "done"
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5"
                    : "border-slate-200 bg-white/80 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900"
                }`}
                onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`font-medium ${
                      milestone.status === "done"
                        ? "text-slate-500 line-through dark:text-slate-400"
                        : "text-slate-700 dark:text-slate-100"
                    }`}
                  >
                    {milestone.title}
                  </h3>

                  <div className="flex shrink-0 items-center gap-2">
                    {milestone.dueDate && (
                      <DeadlinePill category={dueCategory} label={duePillLabel} />
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="mt-3 space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {isEditing ? (
                      <MilestoneEditor
                        title={draftTitle}
                        description={draftDescription}
                        dueDate={draftDueDate}
                        busy={isBusy}
                        onTitleChange={setDraftTitle}
                        onDescriptionChange={setDraftDescription}
                        onDueDateChange={setDraftDueDate}
                        onCancel={cancelEdit}
                        onSave={() => {
                          void saveEdit(milestone.id);
                        }}
                      />
                    ) : (
                      <>
                        {milestone.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.completedAt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Completed: {formatDate(milestone.completedAt)}
                          </p>
                        )}
                      </>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={() => void onMove(milestone.id, "up", orderedIds)}
                        disabled={isBusy || !canMoveUp}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Move up
                      </button>
                      <button
                        onClick={() => void onMove(milestone.id, "down", orderedIds)}
                        disabled={isBusy || !canMoveDown}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Move down
                      </button>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(milestone)}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(milestone.id)}
                        className="rounded-lg px-2 py-1 text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
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
