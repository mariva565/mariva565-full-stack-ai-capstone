import type { ReactNode } from "react";

type AuthSocialButtonProps = {
  label: string;
  badge: string;
  icon: ReactNode;
  onClick: () => void;
};

export function AuthSocialButton({
  label,
  badge,
  icon,
  onClick,
}: AuthSocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-slate-600"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700/70 dark:text-slate-100">
        {icon}
      </span>
      <span>{label}</span>
      <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
        {badge}
      </span>
    </button>
  );
}
