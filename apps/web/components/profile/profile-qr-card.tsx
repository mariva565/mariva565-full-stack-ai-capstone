"use client";

import { useState } from "react";

import { buildMobileProfileQrImageUrl } from "@/lib/profile";
import { LinkIcon, QrCodeIcon } from "./profile-icons";

type ProfileQrCardProps = {
  productionDeepLink: string;
  devDeepLink: string | null;
  userId: number;
};

const COPY_RESET_DELAY_MS = 1600;
const DEV_BASE_HINT = "NEXT_PUBLIC_MOBILE_DEV_DEEP_LINK_BASE";

type LinkVariant = {
  id: "prod" | "dev";
  title: string;
  subtitle: string;
  deepLink: string;
};

type LinkPanelProps = {
  variant: LinkVariant;
  copiedId: "prod" | "dev" | null;
  onCopy: (variantId: "prod" | "dev", deepLink: string) => Promise<void>;
};

function LinkPanel({ variant, copiedId, onCopy }: LinkPanelProps) {
  const qrImageUrl = buildMobileProfileQrImageUrl(variant.deepLink);
  const copied = copiedId === variant.id;

  return (
    <div className="rounded-3xl border border-slate-200/75 bg-white/85 p-4 dark:border-slate-700/70 dark:bg-slate-950/60">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {variant.title}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{variant.subtitle}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <img
          src={qrImageUrl}
          alt={`${variant.title} QR code for user profile link`}
          width={152}
          height={152}
          className="mx-auto h-[152px] w-[152px] rounded-2xl border border-slate-200/75 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
          loading="lazy"
        />

        <div className="space-y-3">
          <code className="block break-all rounded-lg bg-slate-100 px-2 py-1.5 text-[0.72rem] text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {variant.deepLink}
          </code>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void onCopy(variant.id, variant.deepLink)}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 via-fuchsia-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5"
            >
              {copied ? "Copied" : "Copy link"}
            </button>

            <a
              href={variant.deepLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-brand-700 dark:border-white/10 dark:bg-slate-950/65 dark:text-slate-200 dark:hover:text-brand-200"
            >
              <LinkIcon className="h-4 w-4" />
              Open link
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileQrCard({
  productionDeepLink,
  devDeepLink,
  userId,
}: ProfileQrCardProps) {
  const [copiedId, setCopiedId] = useState<"prod" | "dev" | null>(null);
  const [copyError, setCopyError] = useState("");

  const variants: LinkVariant[] = [
    {
      id: "prod",
      title: "Production app link",
      subtitle: "Use this after installing a real mobile build.",
      deepLink: productionDeepLink,
    },
  ];

  if (devDeepLink) {
    variants.push({
      id: "dev",
      title: "Expo Go dev link",
      subtitle: "Use this while testing with Expo Go in local development.",
      deepLink: devDeepLink,
    });
  }

  async function handleCopyLink(variantId: "prod" | "dev", deepLink: string) {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopyError("");
      setCopiedId(variantId);
      window.setTimeout(() => setCopiedId(null), COPY_RESET_DELAY_MS);
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
          Scan a QR to open the mobile profile route for user #{userId}.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {variants.map((variant) => (
          <LinkPanel
            key={variant.id}
            variant={variant}
            copiedId={copiedId}
            onCopy={handleCopyLink}
          />
        ))}

        {!devDeepLink ? (
          <div className="rounded-2xl border border-amber-300/70 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-semibold">Expo Go dev link is not configured.</p>
            <p className="mt-1">
              Set <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">{DEV_BASE_HINT}</code>{" "}
              in `.env.local` (example: <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">exp://192.168.1.9:8081/--</code>).
            </p>
          </div>
        ) : null}

        {copyError ? (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{copyError}</p>
        ) : null}
      </div>
    </section>
  );
}
