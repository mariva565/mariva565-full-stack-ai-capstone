"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from "../ui/action-icons";
import { classifyMilestoneDueDate, formatMilestoneDueDate, toDateKey } from "../../lib/progress";

function toDateInputValue(value: string | null) {
  return toDateKey(value) ?? "";
}
import { DeadlinePill } from "./deadline-pill";
import { MilestoneEditor } from "./milestone-editor";
import type { Milestone } from "./types";
import { ChevronDownIcon, ITEM_SPRING, PANEL_EASE, formatTimelineDate, getTimelineCardSurfaceClass, getTimelineMetaLabel, statusConfig, toTimelinePreviewText } from "./milestone-timeline-item-helpers";

type Props = {
  milestone: Milestone;
  index: number;
  isExpanded: boolean;
  isEditing: boolean;
  isBusy: boolean;
  isRevealed: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  reduceMotion: boolean;
  nextStatusLabel: string;
  onToggleExpand: () => void;
  onCycleStatus: () => void;
  onSetStatus: (status: Milestone["status"]) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (title: string, description: string, dueDate: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
};

const STATUS_OPTIONS: { value: Milestone["status"]; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

function arePropsEqual(prev: Props, next: Props) {
  return (
    prev.milestone === next.milestone &&
    prev.index === next.index &&
    prev.isExpanded === next.isExpanded &&
    prev.isEditing === next.isEditing &&
    prev.isBusy === next.isBusy &&
    prev.isRevealed === next.isRevealed &&
    prev.canMoveUp === next.canMoveUp &&
    prev.canMoveDown === next.canMoveDown &&
    prev.reduceMotion === next.reduceMotion &&
    prev.nextStatusLabel === next.nextStatusLabel
  );
}

export const MilestoneTimelineItem = memo(function MilestoneTimelineItem({
  milestone,
  index,
  isExpanded,
  isEditing,
  isBusy,
  isRevealed,
  canMoveUp,
  canMoveDown,
  reduceMotion,
  nextStatusLabel,
  onToggleExpand,
  onCycleStatus,
  onSetStatus,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const [draftTitle, setDraftTitle] = useState(milestone.title);
  const [draftDescription, setDraftDescription] = useState(milestone.description ?? "");
  const [draftDueDate, setDraftDueDate] = useState(toDateInputValue(milestone.dueDate));
  const cfg = statusConfig[milestone.status];
  const previewText = toTimelinePreviewText(milestone.description);
  const metaLabel = getTimelineMetaLabel(milestone);
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

  const actionButtonClass =
    "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-brand-500/40 dark:hover:text-brand-300";

  return (
    <motion.li
      id={`milestone-${milestone.id}`}
      layout="position"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              duration: 0.28,
              delay: Math.min(index * 0.04, 0.18),
              ease: PANEL_EASE,
            }
      }
      className="relative scroll-mt-28 pl-12"
    >
      <motion.button
        type="button"
        onClick={onCycleStatus}
        disabled={isBusy}
        whileHover={reduceMotion ? undefined : { scale: 1.1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        title={`Click to change to "${nextStatusLabel}"`}
        className={`absolute left-0 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] ring-4 ${cfg.dot} ${cfg.ring}`}
      >
        {!reduceMotion && isRevealed ? (
          <motion.span
            className="absolute inset-0 rounded-full border border-brand-400/55"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.15, opacity: 0 }}
            transition={{ duration: 1.05, ease: "easeOut" }}
          />
        ) : null}
        <span className="h-2.5 w-2.5 rounded-full bg-white/95" />
      </motion.button>

      <motion.article
        layout
        transition={ITEM_SPRING}
        whileHover={reduceMotion ? undefined : { y: -4 }}
        className={`group relative overflow-hidden rounded-[1.45rem] border backdrop-blur-sm ${getTimelineCardSurfaceClass(
          milestone,
          isExpanded,
          isRevealed
        )}`}
      >
        <div className={`pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent ${cfg.line} to-transparent`} />
        <div className={`pointer-events-none absolute -right-6 top-0 h-24 w-24 rounded-full blur-3xl transition duration-300 group-hover:scale-110 ${cfg.orb}`} />
        <div className={`pointer-events-none absolute bottom-5 left-0 top-5 w-1 rounded-r-full ${cfg.dot}`} />
        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-controls={`milestone-panel-${milestone.id}`}
          className="relative w-full px-5 py-4 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm dark:border-white/5 dark:bg-slate-950/35 dark:text-slate-400">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {metaLabel}
                </span>
              </div>
              <h3
                className={`font-rubik mt-3 text-[1.06rem] font-semibold tracking-tight ${
                  milestone.status === "done"
                    ? "text-slate-500 line-through dark:text-slate-400"
                    : "text-slate-800 dark:text-slate-50"
                }`}
              >
                {milestone.title}
              </h3>

              {!isExpanded && previewText ? (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {previewText}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
                {milestone.dueDate ? (
                  <DeadlinePill category={dueCategory} label={duePillLabel} />
                ) : null}
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
            {/* Mobile-only chevron */}
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0, scale: isExpanded ? 1.05 : 1 }}
              transition={reduceMotion ? { duration: 0 } : ITEM_SPRING}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-400 shadow-sm sm:hidden dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400"
            >
              <ChevronDownIcon />
            </motion.span>
            <div className="hidden shrink-0 items-start gap-2 sm:flex">
              {milestone.dueDate ? (
                <DeadlinePill category={dueCategory} label={duePillLabel} />
              ) : null}
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badge}`}
              >
                {cfg.label}
              </span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0, scale: isExpanded ? 1.05 : 1 }}
                transition={reduceMotion ? { duration: 0 } : ITEM_SPRING}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/85 text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400"
              >
                <ChevronDownIcon />
              </motion.span>
            </div>
          </div>
        </button>
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              id={`milestone-panel-${milestone.id}`}
              initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : { duration: 0.26, ease: PANEL_EASE }
              }
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-slate-200/70 px-5 pb-5 pt-4 dark:border-slate-700/70">
                {isEditing ? (
                  <MilestoneEditor
                    title={draftTitle}
                    description={draftDescription}
                    dueDate={draftDueDate}
                    busy={isBusy}
                    onTitleChange={setDraftTitle}
                    onDescriptionChange={setDraftDescription}
                    onDueDateChange={setDraftDueDate}
                    onCancel={onCancelEdit}
                    onSave={() => onSaveEdit(draftTitle, draftDescription, draftDueDate)}
                  />
                ) : (
                  <>
                    {milestone.description?.trim() ? (
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {milestone.description.trim()}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Add a short note when you want more context for this step.
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-950/40">
                        {milestone.dueDate
                          ? `Target ${formatTimelineDate(milestone.dueDate)}`
                          : "No due date yet"}
                      </span>
                      {milestone.completedAt ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Completed {formatTimelineDate(milestone.completedAt)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500 mr-0.5">Status:</span>
                      {STATUS_OPTIONS.map((opt) => {
                        const isActive = milestone.status === opt.value;
                        const optCfg = statusConfig[opt.value];
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isBusy || isActive}
                            onClick={() => onSetStatus(opt.value)}
                            className={
                              isActive
                                ? `rounded-full px-3 py-1 text-xs font-semibold cursor-default ${optCfg.badge}`
                                : "rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-500 transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
                            }
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={isBusy || !canMoveUp}
                    className={actionButtonClass}
                  >
                    <ArrowUpIcon className="h-3.5 w-3.5" />
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={isBusy || !canMoveDown}
                    className={actionButtonClass}
                  >
                    <ArrowDownIcon className="h-3.5 w-3.5" />
                    Move down
                  </button>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={onStartEdit}
                      className={actionButtonClass}
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/80 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.article>
    </motion.li>
  );
}, arePropsEqual);
