type AuthSectionDividerProps = {
  label: string;
  compact?: boolean;
};

export function AuthSectionDivider({ label, compact = false }: AuthSectionDividerProps) {
  return (
    <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <span
        className={`font-semibold uppercase text-slate-400 dark:text-slate-500 ${
          compact ? "text-[0.66rem] tracking-[0.28em]" : "text-[0.72rem] tracking-[0.35em]"
        }`}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
    </div>
  );
}
