import type { ReactNode } from "react";
import { AppFooter } from "../../components/ui/app-footer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <AppFooter />
    </div>
  );
}
