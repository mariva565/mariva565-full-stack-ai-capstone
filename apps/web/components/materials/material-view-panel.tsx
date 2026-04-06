import { MaterialTypePill } from "./material-type-pill";
import { TagList } from "./tag-list";
import { ExternalLinkIcon, PinAngleIcon } from "../ui/action-icons";
import { normalizeMaterialType } from "../../lib/materials";

type MaterialViewPanelProps = {
  title: string;
  materialType: string;
  tags: string[];
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
  isPinned: boolean;
  pinBusy: boolean;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function MaterialViewPanel({
  title,
  materialType,
  tags,
  content,
  fileUrl,
  createdAt,
  isPinned,
  pinBusy,
  onTogglePin,
  onEdit,
  onDelete,
}: MaterialViewPanelProps) {
  const formattedCreatedAt = new Date(createdAt).toLocaleDateString();
  const normalizedType = normalizeMaterialType(materialType);
  const pinLabel = isPinned ? "Remove from quick access" : "Pin to quick access";
  const sourceLabel =
    normalizedType === "file" ? "Open file URL" : "Open saved link";

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
            {fileUrl ? (
              <a
                href={fileUrl}
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
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(99,102,241,0.28)] sm:flex-none"
          >
            Edit material
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-red-200 bg-white/80 px-4 py-2 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900/70 dark:text-red-300 dark:hover:bg-red-900/30 sm:flex-none"
          >
            Delete material
          </button>
        </div>
      </div>

      <TagList tags={tags} />

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
