import Link from "next/link";
import { ThemeToggle } from "../theme/theme-toggle";
import { ArrowLeftIcon } from "./auth-icons";

export function AuthHeaderControls() {
  return (
    <div className="fixed inset-x-4 top-3 z-50 flex items-center justify-between sm:inset-x-6 sm:top-4">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur-md transition hover:-translate-x-0.5 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-indigo-300 sm:px-4 sm:text-sm"
      >
        <ArrowLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Home</span>
      </Link>

      <ThemeToggle />
    </div>
  );
}
