"use client";

import Link from "next/link";
import { AddMilestoneForm } from "../../components/progress/add-milestone-form";
import { DueSoonList } from "../../components/progress/due-soon-list";
import { IdeasBacklog } from "../../components/progress/ideas-backlog";
import { MilestoneTimeline } from "../../components/progress/milestone-timeline";
import { ProgressBar } from "../../components/progress/progress-bar";
import { ProgressSummaryCards } from "../../components/progress/progress-summary-cards";
import { TimelineFilters } from "../../components/progress/timeline-filters";
import { UpcomingEventsPanel } from "../../components/progress/upcoming-events-panel";
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
  } = useProgressPageState();

  if (loading) {
    return <Spinner centered label="Loading milestones..." />;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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

            <Link
              href="/calendar"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_10px_30px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:text-cyan-200 sm:w-auto"
            >
              Open calendar
            </Link>
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

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </>
  );
}
