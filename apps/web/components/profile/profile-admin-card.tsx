import Link from "next/link";

export function ProfileAdminCard() {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.05)]">
      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Admin access
        </span>
        <h2 className="dashboard-script-title text-2xl">Admin panel</h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Review users, content, and activity from the admin area.
        </p>
      </div>

      <Link
        href="/admin"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5"
      >
        Open Admin Panel
      </Link>
    </section>
  );
}
