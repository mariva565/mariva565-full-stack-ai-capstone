import type { ReactNode } from "react";

type MascotEmptyStateProps = {
  message: string;
  subMessage?: string;
  action?: ReactNode;
};

export function MascotEmptyState({ message, subMessage, action }: MascotEmptyStateProps) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-slate-300/80 bg-white/75 px-6 py-10 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/55">
      <img
        src="/assets/v1/ziksi-thinking.png"
        alt=""
        aria-hidden="true"
        width={88}
        height={88}
        className="mx-auto mb-4 h-22 w-22 object-contain drop-shadow-[0_8px_20px_rgba(99,102,241,0.22)] animate-float transition-transform duration-300 hover:scale-110 hover:-rotate-6"
      />
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{message}</p>
      {subMessage && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subMessage}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
