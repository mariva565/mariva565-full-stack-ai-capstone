"use client";

import { formatMemberSince, getProfileInitials } from "@/lib/profile";

type ProfileMemberIdCardProps = {
  userId: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl: string | null;
};

const FOUNDING_MEMBER_CUTOFF = new Date("2026-06-01T00:00:00Z");

function computeMemberTitle(role: string, createdAt: string): string {
  if (role === "admin") return "Administrator";
  if (role === "mentor") return "Mentor";
  if (new Date(createdAt) < FOUNDING_MEMBER_CUTOFF) return "Founding Member";
  return "Student";
}

function formatMemberNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

export function ProfileMemberIdCard({
  userId,
  name,
  email,
  role,
  createdAt,
  avatarUrl,
}: ProfileMemberIdCardProps) {
  const title = computeMemberTitle(role, createdAt);
  const memberSince = formatMemberSince(createdAt);
  const initials = getProfileInitials(name) || "?";
  const memberNumber = formatMemberNumber(userId);

  return (
    <section className="group relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-500 p-6 text-white shadow-[0_20px_60px_-15px_rgba(99,102,241,0.45)] transition-shadow duration-500 hover:shadow-[0_25px_70px_-15px_rgba(168,85,247,0.6)] dark:border-white/10 sm:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.22)_50%,transparent_70%)]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/90" />
        Member ID
      </div>

      <div className="relative mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/50 bg-white/15 text-2xl font-black backdrop-blur-sm sm:h-24 sm:w-24 sm:text-3xl">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="font-shantell text-2xl font-bold leading-tight !text-white sm:text-3xl">{name}</h3>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">
              {title}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-white/85">{email}</p>
          <p className="mt-1 text-xs text-white/70">Member since {memberSince}</p>
        </div>

        <div className="flex shrink-0 flex-col items-start sm:items-end sm:border-l sm:border-white/25 sm:pl-6">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-white/70">Member</span>
          <span className="font-mono text-3xl font-black tracking-tight sm:text-4xl">{memberNumber}</span>
        </div>
      </div>
    </section>
  );
}
