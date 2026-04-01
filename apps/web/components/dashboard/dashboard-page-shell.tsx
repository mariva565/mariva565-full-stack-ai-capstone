import type { ReactNode } from "react";

type DashboardPageShellProps = {
  children: ReactNode;
};

export function DashboardPageShell({ children }: DashboardPageShellProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[linear-gradient(180deg,rgba(224,231,255,0.92)_0%,rgba(255,255,255,0.55)_55%,rgba(255,255,255,0)_100%)] dark:hidden" />
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-200/45 blur-3xl dark:hidden" />
      <div className="pointer-events-none absolute -right-16 top-16 h-80 w-80 rounded-full bg-cyan-200/55 blur-3xl dark:hidden" />

      <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(2,8,23,1)_100%)]" />
      <div className="pointer-events-none absolute -left-28 top-24 hidden h-80 w-80 rounded-full bg-brand-500/10 blur-[120px] dark:block" />
      <div className="pointer-events-none absolute -right-24 top-12 hidden h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-[140px] dark:block" />
      <div className="pointer-events-none absolute bottom-[-12rem] left-1/2 hidden h-[24rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-500/6 blur-[140px] dark:block" />
      <div className="pointer-events-none absolute inset-x-10 top-4 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent dark:block" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 font-poppins sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
