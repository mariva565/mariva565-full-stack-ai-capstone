import Link from "next/link";
import Image from "next/image";

export function AppFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Image
            src="/assets/v1/icons/mascot-logo.png"
            alt="Study Hub logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="home-ink-title text-lg">Study Hub</span>
        </div>

        <p className="text-center text-sm font-medium text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Study Hub. Built with{" "}
          <span className="text-rose-500">❤️</span> for excellence.
        </p>

        <Link
          href="/contact"
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400"
        >
          Contact
        </Link>
      </div>
    </footer>
  );
}
