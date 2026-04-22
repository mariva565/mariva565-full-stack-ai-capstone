type CourseFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function CourseFilters({
  searchValue,
  onSearchChange,
}: CourseFiltersProps) {
  return (
    <div className="mb-4 rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm dark:border-cyan-400/10 dark:bg-slate-950/45">
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search courses..."
        spellCheck={false}
        className="w-full rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
      />
    </div>
  );
}
