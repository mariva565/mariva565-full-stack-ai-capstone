"use client";

import { useCallback } from "react";
import { MaterialTypePill } from "./material-type-pill";
import { MaterialFilePreview } from "./material-file-preview";
import { SmartLinkCard } from "./smart-link-card";
import { TagList } from "./tag-list";
import { ExternalLinkIcon, PinAngleIcon } from "../ui/action-icons";
import {
  getMaterialSourceHref,
  isImageFileUrl,
  isWordFileUrl,
  normalizeMaterialType,
} from "../../lib/materials";

type MaterialViewPanelProps = {
  materialId: number;
  title: string;
  materialType: string;
  tags: string[];
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
  isPinned: boolean;
  pinBusy: boolean;
  isOwner: boolean;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
};

export function MaterialViewPanel({
  materialId,
  title,
  materialType,
  tags,
  content,
  fileUrl,
  createdAt,
  isPinned,
  pinBusy,
  isOwner,
  onTogglePin,
  onEdit,
  onDelete,
  onShare,
}: MaterialViewPanelProps) {
  const formattedCreatedAt = new Date(createdAt).toLocaleDateString();
  const normalizedType = normalizeMaterialType(materialType);
  const sourceHref = getMaterialSourceHref(materialId, materialType, fileUrl);
  const isFileMaterial = normalizedType === "file";
  const isWordFile = isWordFileUrl(fileUrl);
  const headerSourceHref = isFileMaterial ? null : sourceHref;
  const pinLabel = isPinned ? "Remove from quick access" : "Pin to quick access";
  const sourceLabel =
    isFileMaterial && isWordFile
      ? "Download attached file"
      : isFileMaterial
        ? "Open attached file"
        : "Open saved link";

  const handlePrint = useCallback(() => {
    if (!content) return;

    const root = document.createElement("div");
    root.id = "print-root";

    const titleEl = document.createElement("h1");
    titleEl.className = "print-title";
    titleEl.textContent = title;

    const meta = document.createElement("p");
    meta.className = "print-meta";
    meta.textContent = `StudyHub — ${formattedCreatedAt}`;

    const body = document.createElement("div");
    body.className = "print-body";
    body.textContent = content;

    root.append(titleEl, meta, body);
    document.body.appendChild(root);

    window.print();

    document.body.removeChild(root);
  }, [content, title, formattedCreatedAt]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            Saved {formattedCreatedAt}
          </p>
          <h2 className="mt-3 bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_40%,#06b6d4_100%)] bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-brand-300 dark:to-cyan-300">
            {title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MaterialTypePill type={materialType} />
            {headerSourceHref ? (
              <a
                href={headerSourceHref}
                target="_blank"
                rel="noopener noreferrer"
                title={sourceLabel}
                aria-label={sourceLabel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ExternalLinkIcon />
              </a>
            ) : null}
            <button
              type="button"
              disabled={pinBusy}
              onClick={onTogglePin}
              title={pinLabel}
              aria-label={pinLabel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/80 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPinned
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:-translate-y-0.5 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "border-slate-300 text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <PinAngleIcon filled={isPinned} className={isPinned ? "-rotate-[18deg]" : "text-slate-400 dark:text-slate-400"} />
            </button>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(99,102,241,0.28)] sm:flex-none"
              >
                Edit material
              </button>
              {normalizedType === "note" && content ? (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none print:hidden"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 7.134H5.25" />
                  </svg>
                  Save as PDF
                </button>
              ) : null}
              <button
                type="button"
                onClick={onShare}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-brand-200 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900/70 dark:text-brand-300 dark:hover:bg-brand-900/30 sm:flex-none"
              >
                Share
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-red-200 bg-white/80 px-4 py-2 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900/70 dark:text-red-300 dark:hover:bg-red-900/30 sm:flex-none"
              >
                Delete material
              </button>
            </>
          )}
        </div>
      </div>

      <TagList tags={tags} />

      {sourceHref && isFileMaterial ? (
        <MaterialFilePreview
          href={sourceHref}
          title={title}
          isImage={isImageFileUrl(fileUrl)}
          isDownloadOnly={isWordFile}
        />
      ) : null}

      {sourceHref && !isFileMaterial ? <SmartLinkCard url={sourceHref} /> : null}

      {content ? (
        <div className="mt-6 whitespace-pre-wrap rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.94)_0%,rgba(248,250,252,0.9)_100%)] px-5 py-5 text-[15px] leading-7 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.82)_0%,rgba(15,23,42,0.62)_100%)] dark:text-slate-300">
          {content}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No notes saved for this material yet
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Switch to edit mode when you want to add context, reminders, or a quick source summary.
          </p>
        </div>
      )}
    </div>
  );
}
