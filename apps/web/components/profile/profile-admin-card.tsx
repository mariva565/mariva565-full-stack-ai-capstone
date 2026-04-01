import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldIcon, SparklesIcon } from "./profile-icons";

export function ProfileAdminCard() {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.05)]">
      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Admin tools
        </span>
        <h2 className="dashboard-script-title text-2xl">Moderation access</h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Your admin permissions are enforced server-side. Use the admin panel for user
          moderation, material cleanup, and activity review.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <AdminHighlight
          title="Role checks"
          description="Protected endpoints still validate the admin role before any action."
          icon={<ShieldIcon className="h-4 w-4" />}
        />
        <AdminHighlight
          title="Logs ready"
          description="Recent activity logs are already available from the admin workspace."
          icon={<SparklesIcon className="h-4 w-4" />}
        />
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

type AdminHighlightProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

function AdminHighlight({ title, description, icon }: AdminHighlightProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/70 bg-white/80 p-4 shadow-sm dark:border-cyan-400/10 dark:bg-slate-950/55">
      <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}
