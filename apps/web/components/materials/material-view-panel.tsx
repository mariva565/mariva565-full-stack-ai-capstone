import { MaterialTypePill } from "./material-type-pill";
import { TagList } from "./tag-list";
import { ExternalLinkIcon, PinAngleIcon } from "../ui/action-icons";

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
  const pinLabel = isPinned ? "Remove from quick access" : "Pin to quick access";
  const sourceLabel = "Open source";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="dashboard-script-title text-[clamp(2rem,3vw,2.9rem)] leading-[1.04]">
            {title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MaterialTypePill type={materialType} />
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={sourceLabel}
                aria-label={sourceLabel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
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
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-60 ${
                isPinned
                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <PinAngleIcon filled={isPinned} className={isPinned ? "-rotate-[18deg]" : "text-slate-400 dark:text-slate-400"} />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      </div>

      <TagList tags={tags} />

      {content ? (
        <div className="mt-6 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5 whitespace-pre-wrap text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          {content}
        </div>
      ) : (
        <p className="mt-6 rounded-[1.4rem] border border-dashed border-slate-300/80 bg-slate-50/80 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          No content yet.
        </p>
      )}

      <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
        Created on {new Date(createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
