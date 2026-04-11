"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { STATUS_TOAST_LABEL } from "../../lib/progress";
import { MilestoneTimelineItem } from "./milestone-timeline-item";
import type { Milestone, MilestoneUpdate } from "./types";

type MoveDirection = "up" | "down";

type Props = {
  milestones: Milestone[];
  revealedMilestoneId?: number | null;
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

const nextStatus: Record<Milestone["status"], Milestone["status"]> = {
  idea: "not_started",
  not_started: "in_progress",
  in_progress: "done",
  done: "not_started",
};

export function MilestoneTimeline({
  milestones,
  revealedMilestoneId = null,
  onStatusChange,
  onUpdate,
  onMove,
  onDelete,
  busyId = null,
  emptyMessage = "No milestones yet. Add your first one above.",
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [flashedId, setFlashedId] = useState<number | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const orderedIds = milestones.map((item) => item.id);

  useEffect(() => {
    if (!revealedMilestoneId) return;

    setExpandedId(revealedMilestoneId);
    setEditingId(null);
    setFlashedId(revealedMilestoneId);

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(`milestone-${revealedMilestoneId}`)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    });

    const timeoutId = window.setTimeout(() => {
      setFlashedId((current) =>
        current === revealedMilestoneId ? null : current
      );
    }, reduceMotion ? 1600 : 2400);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion, revealedMilestoneId]);

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(milestoneId: number, title: string, description: string, dueDate: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const saved = await onUpdate(milestoneId, {
      title: trimmedTitle,
      description: description.trim(),
      dueDate: dueDate || null,
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
    <div className="relative ml-2 sm:ml-4">
      <div className="pointer-events-none absolute bottom-3 left-4 top-3 w-px bg-gradient-to-b from-brand-200 via-slate-200 to-cyan-200 dark:from-brand-400/40 dark:via-slate-700 dark:to-cyan-300/40" />

      <ul className="space-y-3">
        {milestones.map((milestone, index) => {
          const isExpanded = expandedId === milestone.id;
          const isEditing = editingId === milestone.id;

          return (
            <MilestoneTimelineItem
              key={milestone.id}
              milestone={milestone}
              index={index}
              isExpanded={isExpanded}
              isEditing={isEditing}
              isBusy={busyId === milestone.id}
              isRevealed={flashedId === milestone.id}
              canMoveUp={index > 0}
              canMoveDown={index < milestones.length - 1}
              reduceMotion={reduceMotion}
              nextStatusLabel={STATUS_TOAST_LABEL[nextStatus[milestone.status]]}
              onToggleExpand={() =>
                setExpandedId(isExpanded ? null : milestone.id)
              }
              onCycleStatus={() =>
                onStatusChange(milestone.id, nextStatus[milestone.status])
              }
              onSetStatus={(status) => onStatusChange(milestone.id, status)}
              onStartEdit={() => {
                setExpandedId(milestone.id);
                setEditingId(milestone.id);
              }}
              onCancelEdit={cancelEdit}
              onSaveEdit={(title, description, dueDate) => {
                void saveEdit(milestone.id, title, description, dueDate);
              }}
              onMoveUp={() => void onMove(milestone.id, "up", orderedIds)}
              onMoveDown={() => void onMove(milestone.id, "down", orderedIds)}
              onDelete={() => onDelete(milestone.id)}
            />
          );
        })}
      </ul>
    </div>
  );
}
