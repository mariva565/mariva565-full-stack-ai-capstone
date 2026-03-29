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
    <div className="mb-4 grid gap-3 sm:grid-cols-3">
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search courses..."
        className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
      <select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value as CourseStatusFilter)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      >
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
    </div>
  );
}

export type { CourseStatusFilter };
