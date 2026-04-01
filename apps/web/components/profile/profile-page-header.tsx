import Link from "next/link";
import { ArrowLeftIcon } from "../auth/auth-icons";
import { ThemeToggle } from "../theme/theme-toggle";

export function ProfilePageHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <span className="inline-flex rounded-full border border-brand-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 shadow-sm backdrop-blur dark:border-brand-500/20 dark:bg-slate-900/70 dark:text-brand-200">
          Account settings
        </span>
        <h1 className="dashboard-script-title mt-4 text-4xl sm:text-5xl">
          My Profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
          Manage your workspace identity, keep account details tidy, and update the
          password behind your email sign-in.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-brand-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
