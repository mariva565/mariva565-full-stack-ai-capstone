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
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center animate-[fadeIn_0.3s_ease-out_forwards]"
      role="status"
      aria-live="polite"
    >
      <div className="relative inline-flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
        <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brand-500 border-r-cyan-400 animate-spin" />
      </div>

      <div>
        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>
        {resolvedHint && (
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            {resolvedHint}
          </p>
        )}
      </div>
    </div>
  );
}
