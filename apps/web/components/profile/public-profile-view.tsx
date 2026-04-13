"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProfileUser } from "../../lib/profile";
import {
  formatMemberSince,
  formatRoleLabel,
  getProfileInitials,
} from "@/lib/profile";
import { Toast, type ToastTone } from "../ui/toast";

type PublicProfileViewProps = {
  viewerId: number;
  profileUser: ProfileUser;
};

type ToastState = {
  message: string;
  tone: ToastTone;
} | null;

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }
  return fallback;
}

export function PublicProfileView({ viewerId, profileUser }: PublicProfileViewProps) {
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const isOwnProfile = viewerId === profileUser.id;
  const initials = getProfileInitials(profileUser.name);
  const roleLabel = formatRoleLabel(profileUser.role);
  const memberSince = formatMemberSince(profileUser.createdAt);

  async function handleSendMessage() {
    if (isOwnProfile || messaging) return;

    setMessaging(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profileUser.id }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setToast({
          message: getErrorMessage(payload, "Could not open conversation."),
          tone: "error",
        });
        return;
      }

      const data = (await response.json()) as { id?: unknown };
      if (typeof data.id !== "number" || data.id <= 0) {
        setToast({
          message: "Could not open conversation.",
          tone: "error",
        });
        return;
      }

      router.push(`/messages/${data.id}`);
    } catch {
      setToast({
        message: "Could not open conversation.",
        tone: "error",
      });
    } finally {
      setMessaging(false);
    }
  }

  return (
    <>
      <div className="relative overflow-hidden font-poppins">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-brand-100/70 via-white/40 to-transparent dark:hidden" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl dark:hidden" />
        <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:hidden" />

        <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(2,8,23,1)_100%)]" />
        <div className="pointer-events-none absolute -left-20 top-20 hidden h-72 w-72 rounded-full bg-brand-500/12 blur-3xl dark:block" />
        <div className="pointer-events-none absolute -right-20 top-32 hidden h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl dark:block" />

        <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/community"
              className="text-sm font-semibold text-slate-600 transition hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
            >
              Back to Community
            </Link>
            <Link
              href="/profile"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              My Profile
            </Link>
          </div>

          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.06)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-[-10px] rounded-full bg-gradient-to-br from-brand-400/35 via-fuchsia-400/25 to-cyan-300/35 blur-2xl" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-fuchsia-500 to-cyan-400 p-1 shadow-[0_18px_35px_rgba(99,102,241,0.35)]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-4xl font-black text-brand-700 dark:border-slate-950 dark:bg-slate-950 dark:text-brand-100">
                    {profileUser.avatarUrl ? (
                      <img
                        src={profileUser.avatarUrl}
                        alt={profileUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
              </div>

              <h1 className="dashboard-script-title mt-6 text-3xl sm:text-[2.6rem]">
                {profileUser.name}
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                {roleLabel}
              </div>

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Member since {memberSince}
              </p>

              <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {!isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={messaging}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {messaging ? "Opening..." : "Send message"}
                  </button>
                ) : null}

                {isOwnProfile ? (
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-200 dark:hover:text-brand-200"
                  >
                    Open editable profile
                  </Link>
                ) : (
                  <Link
                    href="/community"
                    className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-200 dark:hover:text-brand-200"
                  >
                    Back to Community
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      ) : null}
    </>
  );
}
