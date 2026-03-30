"use client";

import Link from "next/link";
import { AddMilestoneForm } from "../../components/progress/add-milestone-form";
import { DueSoonList } from "../../components/progress/due-soon-list";
import { IdeasBacklog } from "../../components/progress/ideas-backlog";
import { MilestoneTimeline } from "../../components/progress/milestone-timeline";
import { ProgressBar } from "../../components/progress/progress-bar";
import { ProgressSummaryCards } from "../../components/progress/progress-summary-cards";
import { TimelineFilters } from "../../components/progress/timeline-filters";
import { useProgressPageState } from "../../components/progress/use-progress-page-state";
import { ConfirmModal } from "../../components/ui/confirm-modal";
import { Spinner } from "../../components/ui/spinner";
import { Toast } from "../../components/ui/toast";
import { FILTER_EMPTY_MESSAGE } from "../../lib/progress";

export default function ProgressPage() {
  const {
    loading,
    addBusy,
    ideaBusy,
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
    setTimelineFilter,
    setDeleteId,
    setToast,
    handleAdd,
    handleAddIdea,
    handlePromoteIdea,
    handleStatusChange,
    handleUpdateMilestone,
    handleMoveMilestone,
    confirmDelete,
  } = useProgressPageState();

  if (loading) {
    return <Spinner centered label="Loading milestones..." />;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          &larr; Dashboard
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Capstone Progress</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Keep your milestones clean, track deadlines, and move ideas into action.
          </p>
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
              onStatusChange={handleStatusChange}
              onUpdate={handleUpdateMilestone}
              onMove={handleMoveMilestone}
              onDelete={setDeleteId}
              busyId={rowBusyId}
              emptyMessage={FILTER_EMPTY_MESSAGE[timelineFilter]}
            />
          </div>

          <div className="space-y-6">
            <DueSoonList milestones={dueSoonMilestones} />
            <IdeasBacklog
              ideas={ideas}
              onAdd={handleAddIdea}
              onPromote={handlePromoteIdea}
              onDelete={setDeleteId}
              addBusy={ideaBusy}
            />
          </div>
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

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </>
  );
}
