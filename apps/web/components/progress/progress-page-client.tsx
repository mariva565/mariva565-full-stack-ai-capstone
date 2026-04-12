"use client";

import Link from "next/link";
import { AddMilestoneForm } from "./add-milestone-form";
import { DueSoonList } from "./due-soon-list";
import { IdeasBacklog } from "./ideas-backlog";
import { MilestoneTimeline } from "./milestone-timeline";
import { ProgressBar } from "./progress-bar";
import { ProgressSummaryCards } from "./progress-summary-cards";
import { TimelineFilters } from "./timeline-filters";
import { UpcomingEventsPanel } from "./upcoming-events-panel";
import type { ProgressData } from "./types";
import { useProgressPageState } from "./use-progress-page-state";
import { ConfirmModal } from "../ui/confirm-modal";
import { Toast } from "../ui/toast";
import { FILTER_EMPTY_MESSAGE } from "../../lib/progress";

type ProgressPageClientProps = {
  initialData: ProgressData;
};

export function ProgressPageClient({ initialData }: ProgressPageClientProps) {
  const {
    addBusy,
    ideaBusy,
    events,
    rowBusyId,
    deleteId,
    deleteBusy,
    timelineFilter,
    toast,
    milestones,
    ideas,
    filteredMilestones,
    dueSoonMilestones,
    filterOptions,
    doneCount,
    activeCount,
    overdueCount,
    revealedMilestoneId,
    setTimelineFilter,
    setDeleteId,
    setToast,
    handleAdd,
    handleAddIdea,
    handleEditIdea,
    handlePromoteIdea,
    handleStatusChange,
    handleUpdateMilestone,
    handleMoveMilestone,
    confirmDelete,
  } = useProgressPageState({ initialData });

  return (
    <>
      <div className="font-rubik mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-cyan-200"
        >
          &larr; Dashboard
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_55%,rgba(238,242,255,0.92)_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(15,24,48,0.96)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Progress
              </p>
              <h1 className="dashboard-script-title mt-3 text-4xl md:text-5xl">Capstone Progress</h1>
            </div>
          </div>

          <div className="mt-5">
            <ProgressSummaryCards
              total={milestones.length}
              done={doneCount}
              active={activeCount}
              overdue={overdueCount}
              ideas={ideas.length}
            />
          </div>
        </section>

        {/* Mobile-only: sidebar panels appear before the timeline */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:hidden">
          <UpcomingEventsPanel events={events} />
          <DueSoonList milestones={dueSoonMilestones} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <ProgressBar milestones={milestones} />
            <TimelineFilters
              value={timelineFilter}
              options={filterOptions}
              onChange={setTimelineFilter}
            />
            <AddMilestoneForm onAdd={handleAdd} busy={addBusy} />
            <MilestoneTimeline
              milestones={filteredMilestones}
              revealedMilestoneId={revealedMilestoneId}
              onStatusChange={handleStatusChange}
              onUpdate={handleUpdateMilestone}
              onMove={handleMoveMilestone}
              onDelete={setDeleteId}
              busyId={rowBusyId}
              emptyMessage={FILTER_EMPTY_MESSAGE[timelineFilter]}
            />
          </div>

          {/* Desktop-only right column */}
          <div className="hidden space-y-6 lg:block">
            <UpcomingEventsPanel events={events} />
            <DueSoonList milestones={dueSoonMilestones} />
          </div>
        </div>

        <div className="mt-6">
          <IdeasBacklog
            ideas={ideas}
            onAdd={handleAddIdea}
            onEdit={handleEditIdea}
            onPromote={handlePromoteIdea}
            onDelete={setDeleteId}
            addBusy={ideaBusy}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete this item?"
        description="This will permanently remove it."
        confirmLabel="Delete"
        busy={deleteBusy}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      {toast ? <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
    </>
  );
}
