type SpinnerProps = {
  label?: string;
  centered?: boolean;
  hint?: string;
};

const DEFAULT_HINT = "This should only take a moment.";

export function Spinner({ label = "Loading your workspace...", centered = false, hint }: SpinnerProps) {
  const resolvedHint = hint ?? DEFAULT_HINT;

  if (!centered) {
    return (
      <div className="inline-flex items-center gap-3" role="status" aria-live="polite">
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-brand-200 dark:border-slate-700" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 border-r-cyan-400 animate-spin" />
        </span>
        <span className="font-poppins text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(241,245,249,0.95)_55%,rgba(238,242,255,0.92)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,8,22,0.98)_0%,rgba(6,12,28,0.96)_55%,rgba(8,15,30,0.98)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/10" />

      <div className="relative w-full max-w-sm rounded-[1.75rem] border border-white/65 bg-white/92 p-7 shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:p-8 dark:border-slate-800 dark:bg-slate-950/84">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/88 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" />
            StudyHub
          </div>

          <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-brand-100 dark:border-slate-800" />
            <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 border-r-cyan-400 animate-spin" />
            <span className="absolute inset-[0.55rem] rounded-full bg-white dark:bg-slate-950" />
          </div>

          <p className="font-poppins text-xl font-semibold tracking-tight text-slate-800 sm:text-[1.65rem] dark:text-slate-100">
            {label}
          </p>
          <p className="font-poppins mt-3 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
            {resolvedHint}
          </p>
        </div>
      </div>
    </div>
  );
}
