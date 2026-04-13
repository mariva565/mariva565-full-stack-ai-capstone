export const STATUS_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "hidden", label: "Hidden" },
  { value: "", label: "All" },
] as const;

export const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  hidden: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const TYPE_STYLES: Record<string, string> = {
  discussion:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  question:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  resource:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  article:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

