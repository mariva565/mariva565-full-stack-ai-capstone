import { parseTags } from "../../lib/materials";
import {
  PinnedMaterialItem,
  type PinnedMaterial,
} from "./pinned-material-item";

type PinnedSidebarProps = {
  favorites: PinnedMaterial[];
  searchValue: string;
  activeTag: string | null;
  onSearchChange: (value: string) => void;
  onTagSelect: (value: string | null) => void;
};

export function PinnedSidebar({
  favorites,
  searchValue,
  activeTag,
  onSearchChange,
  onTagSelect,
}: PinnedSidebarProps) {
  const availableTags = Array.from(
    new Set(
      favorites.flatMap((favorite) => parseTags(favorite.tags))
    )
  ).sort((left, right) => left.localeCompare(right));

  const filteredItems = favorites.filter((favorite) => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      favorite.materialTitle.toLowerCase().includes(normalizedQuery) ||
      favorite.courseTitle.toLowerCase().includes(normalizedQuery) ||
      parseTags(favorite.tags).some((tag) =>
        tag.toLowerCase().includes(normalizedQuery)
      );

    if (!matchesSearch) {
      return false;
    }

    if (!activeTag) {
      return true;
    }

    return parseTags(favorite.tags)
      .map((tag) => tag.toLowerCase())
      .includes(activeTag.toLowerCase());
  });

  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Pinned Materials
      </h2>
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search pinned..."
        className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />

      {availableTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTagSelect(null)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              activeTag === null
                ? "bg-brand-600 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            All tags
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(tag)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                activeTag === tag
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {filteredItems.length === 0 && (
          <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            No pinned materials for this filter.
          </li>
        )}
        {filteredItems.map((item) => (
          <PinnedMaterialItem key={item.id} item={item} />
        ))}
      </ul>
    </aside>
  );
}
