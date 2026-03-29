type SpinnerProps = {
  label?: string;
  centered?: boolean;
};

export function Spinner({ label = "Loading...", centered = false }: SpinnerProps) {
  const containerClass = centered
    ? "flex min-h-[40vh] items-center justify-center"
    : "flex items-center";

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600 dark:border-brand-400/50 dark:border-t-brand-200" />
        <span>{label}</span>
      </div>
    </div>
  );
}
