import type { ReactNode } from "react";
import { PageBackgroundShell } from "../layout/page-background-shell";

type DashboardPageShellProps = {
  children: ReactNode;
};

export function DashboardPageShell({ children }: DashboardPageShellProps) {
  return (
    <PageBackgroundShell contentClassName="max-w-6xl px-4 py-8 font-poppins sm:px-6 lg:px-8">
      {children}
    </PageBackgroundShell>
  );
}
