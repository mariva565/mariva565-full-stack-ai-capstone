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
      className="relative flex min-h-[50vh] flex-col items-center justify-center p-8 text-center animate-[fadeIn_0.3s_ease-out_forwards]"
      role="status"
      aria-live="polite"
    >
      {/* Subtle ambient glow behind the spinner */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-[60px] dark:bg-brand-500/20" />

      {/* Elegant Spinner */}
      <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center">
        {/* Track border */}
        <span className="absolute inset-0 rounded-full border-[3px] border-brand-500/10 dark:border-white/5" />
        {/* Animated primary ring */}
        <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brand-500 border-r-pink-500 animate-spin" />
        {/* Glowing center dot */}
        <span className="absolute h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-400 to-pink-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-pulse" />
      </div>

      <p className="mb-2 text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
        {label}
      </p>
      
      {resolvedHint && (
        <p className="max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400 opacity-80">
          {resolvedHint}
        </p>
      )}
    </div>
  );
}
