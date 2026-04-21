import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseTags } from "../../lib/materials";
import { PinnedMaterialItem } from "./pinned-material-item";
import { SharedMaterialItem } from "./shared-material-item";
import { DashboardPillButton } from "./dashboard-controls";
import type { PinnedMaterial, SharedMaterial } from "./types";

type PinnedSidebarProps = {
  favorites: PinnedMaterial[];
  shared?: SharedMaterial[];
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
  shared = [],
  searchValue,
  activeTag,
  onSearchChange,
  onTagSelect,
}: PinnedSidebarProps) {
  const [activeTab, setActiveTab] = useState<"pinned" | "shared">("pinned");

  const availableTags = useMemo(
    () =>
      Array.from(new Set(favorites.flatMap((favorite) => parseTags(favorite.tags)))).sort(
        (left, right) => left.localeCompare(right)
      ),
    [favorites]
  );

  const filteredFavorites = useMemo(
    () =>
      favorites.filter((favorite) => {
        const normalizedQuery = searchValue.trim().toLowerCase();
        const matchesSearch =
          normalizedQuery.length === 0 ||
          favorite.materialTitle.toLowerCase().includes(normalizedQuery) ||
          favorite.moduleTitle.toLowerCase().includes(normalizedQuery) ||
          favorite.courseTitle.toLowerCase().includes(normalizedQuery) ||
          parseTags(favorite.tags).some((tag) => tag.toLowerCase().includes(normalizedQuery));

        if (!matchesSearch) return false;
        if (!activeTag) return true;
        return parseTags(favorite.tags)
          .map((tag) => tag.toLowerCase())
          .includes(activeTag.toLowerCase());
      }),
    [favorites, searchValue, activeTag]
  );

  const filteredShared = useMemo(
    () =>
      shared.filter((s) => {
        const normalizedQuery = searchValue.trim().toLowerCase();
        return (
          normalizedQuery.length === 0 ||
          s.title.toLowerCase().includes(normalizedQuery) ||
          s.context.toLowerCase().includes(normalizedQuery) ||
          (s.sharedBy.name && s.sharedBy.name.toLowerCase().includes(normalizedQuery)) ||
          (s.sharedBy.email && s.sharedBy.email.toLowerCase().includes(normalizedQuery))
        );
      }),
    [shared, searchValue]
  );

  return (
    <motion.aside
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative overflow-hidden flex flex-col min-h-[400px] rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.94)_60%,rgba(238,242,255,0.92)_100%)] p-4 shadow-[0_22px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_82%_16%,rgba(226,232,240,0.14)_0%,rgba(148,163,184,0.08)_18%,rgba(15,23,42,0)_42%),linear-gradient(160deg,rgba(16,24,48,0.95)_0%,rgba(8,16,38,0.95)_58%,rgba(5,12,28,0.98)_100%)] dark:shadow-[0_28px_90px_rgba(2,12,27,0.66),0_0_36px_rgba(6,182,212,0.05)]"
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        Quick Access
      </p>

      <div className="mt-2 flex gap-1 rounded-full bg-slate-100/80 p-1 dark:bg-slate-900/60 w-fit">
        <button
          onClick={() => setActiveTab("pinned")}
          className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            activeTab === "pinned"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {activeTab === "pinned" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-slate-800"
            />
          )}
          <span className="relative z-10">Pinned</span>
        </button>
        <button
          onClick={() => setActiveTab("shared")}
          className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            activeTab === "shared"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {activeTab === "shared" && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-slate-800"
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            Shared
            {shared.length > 0 && activeTab !== "shared" && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-100 text-[9px] font-bold text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300">
                {shared.length}
              </span>
            )}
          </span>
        </button>
      </div>

      <div className="pointer-events-none absolute -right-10 top-[-1rem] hidden h-28 w-28 rounded-full bg-white/10 blur-3xl dark:block" />
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={`Search ${activeTab === "pinned" ? "pinned" : "shared"}...`}
        spellCheck={false}
        className="mt-3 block w-full rounded-[1rem] border border-slate-200/80 bg-white/95 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700/80 dark:bg-slate-950/60 dark:text-white"
      />

      {activeTab === "pinned" && availableTags.length > 0 && (
        <TagFilterButtons
          availableTags={availableTags}
          activeTag={activeTag}
          onTagSelect={onTagSelect}
        />
      )}

      <ul className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1">
        {activeTab === "pinned" ? (
          <>
            {filteredFavorites.length === 0 && (
              <li className="rounded-xl border border-slate-200/80 bg-white/92 px-4 py-3 text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/55 dark:text-slate-400">
                No pinned materials for this filter.
              </li>
            )}
            {filteredFavorites.map((item) => (
              <PinnedMaterialItem key={item.id} item={item} />
            ))}
          </>
        ) : (
          <>
            {filteredShared.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-200/80 bg-white/50 px-4 py-5 text-center text-sm text-slate-500 dark:border-slate-800/80 dark:bg-slate-950/30 dark:text-slate-400">
                {shared.length === 0
                  ? "Nobody has shared materials with you yet."
                  : "No shared materials found matching your search."}
              </li>
            )}
            {filteredShared.map((item) => (
              <SharedMaterialItem key={item.id} item={item} />
            ))}
          </>
        )}
      </ul>
    </motion.aside>
  );
}
