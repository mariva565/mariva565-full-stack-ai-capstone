import Link from "next/link";

import { FILTER_OPTIONS, SORT_OPTIONS } from "../../lib/course-materials";
import type { MaterialFilter, MaterialSort } from "../../lib/materials";

type ModuleWorkspaceHeaderProps = {
  courseId: number;
  courseTitle: string;
  moduleTitle: string;
  moduleDescription: string | null;
  materialCount: number;
  pinnedCount: number;
  searchQuery: string;
  sortBy: MaterialSort;
  filterBy: MaterialFilter;
  showCreateForm: boolean;
  onSearchQueryChange: (value: string) => void;
  onSortChange: (value: MaterialSort) => void;
  onFilterChange: (value: MaterialFilter) => void;
  onToggleCreateForm: () => void;
};

export function ModuleWorkspaceHeader({
  courseId,
  courseTitle,
  moduleTitle,
  moduleDescription,
  materialCount,
  pinnedCount,
  searchQuery,
  sortBy,
  filterBy,
  showCreateForm,
  onSearchQueryChange,
  onSortChange,
  onFilterChange,
  onToggleCreateForm,
}: ModuleWorkspaceHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_58%,rgba(238,242,255,0.92)_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12)_0%,rgba(34,211,238,0)_26%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(9,17,34,0.96)_55%,rgba(6,12,28,0.98)_100%)]">
      <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-fuchsia-200/70 blur-3xl dark:bg-fuchsia-500/10" />
      <div className="pointer-events-none absolute left-0 top-12 h-28 w-28 rounded-full bg-cyan-200/60 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition hover:text-brand-700 dark:text-brand-100"
            >
              <span aria-hidden="true">&larr;</span>
              {courseTitle}
            </Link>
            <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
              Module
            </p>
            <h1 className="dashboard-script-title mt-3 text-4xl md:text-5xl">{moduleTitle}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {moduleDescription?.trim() || "Keep notes, links, and file URLs together in one focused place."}
            </p>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {materialCount} {materialCount === 1 ? "study item" : "study items"} / {pinnedCount} pinned
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleCreateForm}
            className={`group inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition sm:w-auto ${
              showCreateForm
                ? "border border-slate-200 bg-white/85 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                : "bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] text-white shadow-[0_20px_45px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(99,102,241,0.32)]"
            }`}
          >
            {showCreateForm ? (
              "Close"
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block text-base leading-none transition duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1 group-hover:scale-110 group-hover:rotate-90">
                  +
                </span>
                <span>Add material</span>
              </span>
            )}
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_220px]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
            placeholder="Search title, notes, or tags..."
          />

          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as MaterialSort)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                filterBy === option.value
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
