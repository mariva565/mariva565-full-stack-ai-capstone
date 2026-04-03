import type { ReactNode } from "react";
import Link from "next/link";
import {
  formatMemberSince,
  formatRoleLabel,
  getProfileInitials,
  getProfileStatus,
} from "@/lib/profile";
import { CameraIcon, CalendarIcon, ShieldIcon, SparklesIcon } from "./profile-icons";

type ProfileHeroCardProps = {
  email: string;
  name: string;
  role: string;
  createdAt: string;
  avatarUrl: string | null;
  hasUnsavedChanges: boolean;
  avatarBusy?: boolean;
  onClearAvatar: () => void;
};

export function ProfileHeroCard({
  email,
  name,
  role,
  createdAt,
  avatarUrl,
  hasUnsavedChanges,
  avatarBusy = false,
  onClearAvatar,
}: ProfileHeroCardProps) {
  const roleLabel = formatRoleLabel(role);
  const initials = getProfileInitials(name);
  const memberSince = formatMemberSince(createdAt);
  const status = getProfileStatus(Boolean(avatarUrl), hasUnsavedChanges);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.06)]">
      <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-500/14" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm dark:bg-slate-950/60 dark:text-slate-300">
          <SparklesIcon className="h-4 w-4" />
          Account overview
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-[-10px] rounded-full bg-gradient-to-br from-brand-400/35 via-fuchsia-400/25 to-cyan-300/35 blur-2xl" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 p-1 shadow-[0_18px_35px_rgba(99,102,241,0.35)]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-4xl font-black text-brand-700 dark:border-slate-950 dark:bg-slate-950 dark:text-brand-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            {avatarUrl ? (
              <button
                type="button"
                onClick={onClearAvatar}
                disabled={avatarBusy}
                className="absolute bottom-1 right-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-slate-700 shadow-lg transition hover:-translate-y-0.5 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-red-300"
                aria-label="Clear avatar"
                title="Clear avatar"
              >
                <CameraIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <h2 className="dashboard-script-title mt-6 text-3xl sm:text-[2.6rem]">{name}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{email}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
            <ShieldIcon className="h-4 w-4" />
            {roleLabel}
          </div>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            {status.description}
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatTile label="Role" value={roleLabel} icon={<ShieldIcon className="h-4 w-4" />} />
          <StatTile label="Joined" value={memberSince} icon={<CalendarIcon className="h-4 w-4" />} />
          <StatTile label="Status" value={status.label} icon={<SparklesIcon className="h-4 w-4" />} />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-brand-100/80 bg-brand-50/80 p-4 text-sm text-slate-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-slate-200">
          <p className="font-semibold text-slate-900 dark:text-white">
            Direct avatar uploads are still pending.
          </p>
          <p className="mt-1 leading-6 text-slate-600 dark:text-slate-300">
            External `https://` image URLs work today. Direct uploads stay paused until
            the storage flow is finalized.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 sm:w-auto"
          >
            Open Dashboard
          </Link>

          {role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-200 dark:hover:text-brand-200 sm:w-auto"
            >
              Open Admin Panel
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type StatTileProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/70 bg-white/75 px-4 py-3 text-left shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
