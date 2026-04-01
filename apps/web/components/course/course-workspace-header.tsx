import type { FormEvent } from "react";
import Link from "next/link";

import { FILTER_OPTIONS, SORT_OPTIONS } from "../../lib/course-materials";
import type { MaterialFilter, MaterialSort } from "../../lib/materials";

type CourseWorkspaceHeaderProps = {
  title: string;
  description: string | null;
  searchQuery: string;
  sortBy: MaterialSort;
  filterBy: MaterialFilter;
  showModuleForm: boolean;
  newModuleTitle: string;
  onSearchQueryChange: (value: string) => void;
  onSortChange: (value: MaterialSort) => void;
  onFilterChange: (value: MaterialFilter) => void;
  onToggleModuleForm: () => void;
  onModuleTitleChange: (value: string) => void;
  onCreateModule: (event: FormEvent) => void;
};

export function CourseWorkspaceHeader({
  title,
  description,
  searchQuery,
  sortBy,
  filterBy,
  showModuleForm,
  newModuleTitle,
  onSearchQueryChange,
  onSortChange,
  onFilterChange,
  onToggleModuleForm,
  onModuleTitleChange,
  onCreateModule,
}: CourseWorkspaceHeaderProps) {
  return (
    <>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-100"
      >
        &larr; Back to dashboard
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {description || "Organize your study notes, links, and files by modules, tags, and pin status."}
        </p>
        <div className="mt-4 rounded-2xl border border-brand-200/70 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-brand-500/20 dark:bg-slate-800/60 dark:text-slate-300">
          Text notes are fully usable right now. Create a module, write in <span className="font-semibold text-slate-900 dark:text-white">Content</span>, and save the material even if file uploads are still postponed.
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[2fr_1fr]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            placeholder="Search title, content or tags..."
          />

          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as MaterialSort)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
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
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filterBy === option.value
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Modules</h2>
          <button
            type="button"
            onClick={onToggleModuleForm}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {showModuleForm ? "Close module form" : "+ New module"}
          </button>
        </div>

        {showModuleForm && (
          <form onSubmit={onCreateModule} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newModuleTitle}
              onChange={(event) => onModuleTitleChange(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="e.g. JavaScript Fundamentals"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Create
            </button>
          </form>
        )}
      </div>
    </>
  );
}
