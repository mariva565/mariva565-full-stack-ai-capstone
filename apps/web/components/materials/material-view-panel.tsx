import { MaterialTypePill } from "./material-type-pill";
import { TagList } from "./tag-list";

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
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MaterialTypePill type={materialType} />
            <button
              type="button"
              disabled={pinBusy}
              onClick={onTogglePin}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                isPinned
                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {isPinned ? "Pinned" : "Pin"}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
          >
            Delete
          </button>
        </div>
      </div>

      <TagList tags={tags} />

      {content ? (
        <div className="mt-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
          {content}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">No content yet.</p>
      )}

      {fileUrl && (
        <div className="mt-6">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-100"
          >
            Open attached link/file &rarr;
          </a>
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
        Created on {new Date(createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
