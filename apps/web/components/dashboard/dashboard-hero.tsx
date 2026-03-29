type DashboardHeroProps = {
  courseCount: number;
  draftCount: number;
  pinnedCount: number;
  showCreateForm: boolean;
  onToggleCreateForm: () => void;
};

export function DashboardHero({
  courseCount,
  draftCount,
  pinnedCount,
  showCreateForm,
  onToggleCreateForm,
}: DashboardHeroProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Study Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Organize courses, keep your most important materials pinned, and find
            things fast.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleCreateForm}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {showCreateForm ? "Close form" : "+ New Course"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Courses
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {courseCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Drafts
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {draftCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Pinned Materials
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {pinnedCount}
          </p>
        </div>
      </div>
    </section>
  );
}
