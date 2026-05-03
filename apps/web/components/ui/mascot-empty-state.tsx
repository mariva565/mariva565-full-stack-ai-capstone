import type { ReactNode } from "react";
import { ZiksiMascot } from "./ziksi-mascot";

type MascotEmptyStateProps = {
  message: string;
  subMessage?: string;
  action?: ReactNode;
};

export function MascotEmptyState({ message, subMessage, action }: MascotEmptyStateProps) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-slate-300/80 bg-white/75 px-6 py-10 text-center shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/55">
      <ZiksiMascot src="/assets/v1/ziksi-thinking.png" size="md" className="mx-auto mb-4" />
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{message}</p>
      {subMessage && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subMessage}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
