"use client";

import { useState } from "react";

import { buildMobileProfileQrImageUrl } from "@/lib/profile";
import { LinkIcon, MobileIcon, QrCodeIcon } from "./profile-icons";

type ProfileQrCardProps = {
  deepLink: string;
  userId: number;
};

const COPY_RESET_DELAY_MS = 1600;

export function ProfileQrCard({ deepLink, userId }: ProfileQrCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const qrImageUrl = buildMobileProfileQrImageUrl(deepLink);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopyError("");
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
    } catch {
      setCopyError("Clipboard is blocked in this browser. Copy the link manually.");
    }
  }

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[linear-gradient(160deg,rgba(8,16,38,0.94)_0%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.72),0_0_42px_rgba(6,182,212,0.05)]">
      <div className="flex flex-col gap-2">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Mobile handoff
        </span>
        <h2 className="dashboard-script-title flex items-center gap-2 text-2xl">
          <QrCodeIcon className="h-5 w-5" />
          Profile QR link
        </h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Scan this QR to open the mobile profile route for user #{userId}.
        </p>
      </div>

      <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200/75 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-950/55 sm:grid-cols-[auto_1fr] sm:items-center">
        <img
          src={qrImageUrl}
          alt={`QR code for StudyHub mobile profile link of user ${userId}`}
          width={180}
          height={180}
          className="mx-auto h-[180px] w-[180px] rounded-2xl border border-slate-200/75 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
          loading="lazy"
        />

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3 text-xs text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="mb-2 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <MobileIcon className="h-4 w-4" />
              Deep link
            </p>
            <code className="block break-all rounded-lg bg-slate-100 px-2 py-1.5 text-[0.72rem] dark:bg-slate-800/70">
              {deepLink}
            </code>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5"
            >
              {copied ? "Copied" : "Copy deep link"}
            </button>

            <a
              href={deepLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-200 dark:hover:text-brand-200"
            >
              <LinkIcon className="h-4 w-4" />
              Open in app
            </a>
          </div>
          {copyError ? (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{copyError}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
