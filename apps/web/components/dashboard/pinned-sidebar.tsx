import { motion } from "framer-motion";
import { parseTags } from "../../lib/materials";
import {
  PinnedMaterialItem,
  type PinnedMaterial,
} from "./pinned-material-item";
import { DashboardPillButton } from "./dashboard-controls";

type PinnedSidebarProps = {
  favorites: PinnedMaterial[];
  searchValue: string;
  activeTag: string | null;
  onSearchChange: (value: string) => void;
  onTagSelect: (value: string | null) => void;
};

type TagFilterButtonsProps = {
  availableTags: string[];
  activeTag: string | null;
  onTagSelect: (value: string | null) => void;
};

function TagFilterButtons({
  availableTags,
  activeTag,
  onTagSelect,
}: TagFilterButtonsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <DashboardPillButton
        onClick={() => onTagSelect(null)}
        active={activeTag === null}
        tone="brand"
        className="text-slate-600 dark:text-slate-300"
      >
        All tags
      </DashboardPillButton>
      {availableTags.map((tag) => (
        <DashboardPillButton
          key={tag}
          onClick={() => onTagSelect(tag)}
          active={activeTag === tag}
          tone="brand"
          className="text-slate-600 dark:text-slate-300"
        >
          {tag}
        </DashboardPillButton>
      ))}
    </div>
  );
}

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
      favorite.moduleTitle.toLowerCase().includes(normalizedQuery) ||
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
    <motion.aside
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_60%,rgba(238,242,255,0.92)_100%)] p-4 shadow-[0_22px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(16,24,48,0.95)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.66),0_0_36px_rgba(6,182,212,0.05)]"
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        My Shelf
      </p>
      <h2 className="dashboard-panel-title mt-1 text-3xl">
        Pinned Materials
      </h2>
      <div className="pointer-events-none absolute -right-10 top-[-1rem] hidden h-28 w-28 rounded-full bg-white/10 blur-3xl dark:block" />
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search pinned..."
        className="mt-3 block w-full rounded-[1rem] border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
      />

      {availableTags.length > 0 && (
        <TagFilterButtons
          availableTags={availableTags}
          activeTag={activeTag}
          onTagSelect={onTagSelect}
        />
      )}

      <ul className="mt-4 space-y-3">
        {filteredItems.length === 0 && (
          <li className="rounded-xl border border-slate-200/80 bg-white/92 px-4 py-3 text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/55 dark:text-slate-400">
            No pinned materials for this filter.
          </li>
        )}
        {filteredItems.map((item) => (
          <PinnedMaterialItem key={item.id} item={item} />
        ))}
      </ul>
    </motion.aside>
  );
}
