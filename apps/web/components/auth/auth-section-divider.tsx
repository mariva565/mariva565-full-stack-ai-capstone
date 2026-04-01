type AuthSectionDividerProps = {
  label: string;
};

export function AuthSectionDivider({ label }: AuthSectionDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
    </div>
  );
}
