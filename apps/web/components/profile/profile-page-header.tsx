import Link from "next/link";
import { ArrowLeftIcon } from "../auth/auth-icons";
import { ThemeToggle } from "../theme/theme-toggle";
import { WayfindingBreadcrumbs } from "../ui/wayfinding-breadcrumbs";

export function ProfilePageHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <WayfindingBreadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Profile" },
          ]}
        />
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
          Profile
        </p>
        <h1 className="dashboard-script-title mt-4 text-4xl sm:text-5xl">
          My Profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
          Manage your account details, avatar link, and sign-in settings in one
          place.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-brand-200 sm:w-auto"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
