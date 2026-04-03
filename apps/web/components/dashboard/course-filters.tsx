type CourseStatusFilter = "all" | "draft" | "published";

type CourseFiltersProps = {
  searchValue: string;
  statusValue: CourseStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CourseStatusFilter) => void;
};

export function CourseFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
}: CourseFiltersProps) {
  return (
    <div className="mb-4 rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm dark:border-cyan-400/10 dark:bg-slate-950/45">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search courses..."
          className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
        />
        <select
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value as CourseStatusFilter)}
          className="rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
        >
          <option value="all">All course states</option>
          <option value="draft">Draft courses</option>
          <option value="published">Published courses</option>
        </select>
      </div>
    </div>
  );
}

export type { CourseStatusFilter };
