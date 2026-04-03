import { motion } from "framer-motion";
import Link from "next/link";

import type { CourseMaterial } from "../../lib/course-materials";
import { normalizeMaterialType, parseTags } from "../../lib/materials";
import { MaterialTypePill } from "../materials/material-type-pill";
import { ExternalLinkIcon, PencilIcon, PinAngleIcon } from "../ui/action-icons";
import { TagList } from "../materials/tag-list";

type MaterialRowProps = {
  material: CourseMaterial;
  isPinned: boolean;
  pinBusy: boolean;
  onTogglePin: (materialId: number, isPinned: boolean) => void;
};

const TYPE_SURFACE = {
  note:
    "bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)] text-white shadow-[0_14px_32px_rgba(245,158,11,0.28)]",
  link:
    "bg-[linear-gradient(135deg,#06b6d4_0%,#0891b2_100%)] text-white shadow-[0_14px_32px_rgba(6,182,212,0.28)]",
  file:
    "bg-[linear-gradient(135deg,#64748b_0%,#334155_100%)] text-white shadow-[0_14px_32px_rgba(51,65,85,0.26)]",
} as const;

const TYPE_HALO = {
  note: "bg-amber-300/65",
  link: "bg-cyan-300/60",
  file: "bg-slate-400/45",
} as const;

type MaterialSurfaceType = keyof typeof TYPE_SURFACE;

function getContentPreview(content: string | null): string | null {
  const normalized = content?.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return null;
  }

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function MaterialTypeIllustration({ type }: { type: MaterialSurfaceType }) {
  const iconProps = {
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (type === "note") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
        <path d="M7 4.75h7l3.25 3.25V19H7V4.75Z" fill="currentColor" fillOpacity="0.18" {...iconProps} />
        <path d="M14 4.75V8h3.25" {...iconProps} />
        <path d="M9.1 11.1h5.9" {...iconProps} />
        <path d="M9.1 14.2h5.1" {...iconProps} />
        <path d="M9.1 17.1h3.4" {...iconProps} />
      </svg>
    );
  }

  if (type === "link") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
        <path d="M10.1 14l3.8-3.8" {...iconProps} />
        <path d="M8.2 16l-1.3 1.3a2.85 2.85 0 1 1-4-4l2.2-2.2a2.85 2.85 0 0 1 4 0l1.1 1.1" {...iconProps} />
        <path d="M15.8 8l1.3-1.3a2.85 2.85 0 1 1 4 4l-2.2 2.2a2.85 2.85 0 0 1-4 0l-1.1-1.1" {...iconProps} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path d="M7 4.75h7l3.25 3.25V19H7V4.75Z" fill="currentColor" fillOpacity="0.14" {...iconProps} />
      <path d="M14 4.75V8h3.25" {...iconProps} />
      <path d="M11.1 10.8l3-3a2 2 0 1 1 2.85 2.8l-3.6 3.65a2.35 2.35 0 1 1-3.35-3.3l2.4-2.45" {...iconProps} />
    </svg>
  );
}

export function MaterialRow({
  material,
  isPinned,
  pinBusy,
  onTogglePin,
}: MaterialRowProps) {
  const materialHref = `/materials/${material.id}`;
  const normalizedType = normalizeMaterialType(material.materialType);
  const tags = parseTags(material.tags);
  const preview = getContentPreview(material.content);
  const pinLabel = isPinned ? "Remove from quick access" : "Pin to quick access";
  const sourceLabel =
    normalizedType === "file" ? "Open file URL" : "Open saved link";

  return (
    <li className="group relative overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.95)_58%,rgba(238,242,255,0.92)_100%)] shadow-[0_24px_55px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(99,102,241,0.12)] dark:border-cyan-400/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1)_0%,rgba(34,211,238,0)_26%),linear-gradient(160deg,rgba(15,23,42,0.97)_0%,rgba(9,17,34,0.96)_55%,rgba(6,12,28,0.98)_100%)] dark:hover:shadow-[0_28px_65px_rgba(6,182,212,0.08)]">
      <div className="pointer-events-none absolute inset-y-5 left-0 w-1 rounded-full bg-[linear-gradient(180deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] opacity-70" />

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <Link
            href={materialHref}
            className="block min-w-0 rounded-[1.4rem] transition outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-cyan-300/70 dark:focus-visible:ring-offset-slate-950"
          >
            <div className="flex min-w-0 gap-4">
              <motion.div
                whileHover={{
                  scale: 1.14,
                  y: -3,
                  rotate: [0, -5, 7, 0],
                }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="relative flex-none"
              >
                <div
                  className={`absolute inset-1 rounded-[1.15rem] opacity-0 blur-xl transition duration-300 group-hover:opacity-100 ${TYPE_HALO[normalizedType]}`}
                />
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-[1.35rem] transition duration-300 group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] ${TYPE_SURFACE[normalizedType]}`}
                >
                  <MaterialTypeIllustration type={normalizedType} />
                </div>
              </motion.div>

              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                  Saved {new Date(material.createdAt).toLocaleDateString()}
                </p>
                <span className="dashboard-script-title mt-2 block text-[clamp(1.35rem,2.15vw,1.8rem)] leading-[1.12] transition group-hover:translate-x-0.5">
                  {material.title}
                </span>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <MaterialTypePill type={material.materialType} />
                </div>
              </div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              href={materialHref}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_55%,#06b6d4_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(99,102,241,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(99,102,241,0.28)]"
            >
              Open material
            </Link>
            <Link
              href={`${materialHref}?edit=1`}
              title="Edit material"
              aria-label="Edit material"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <PencilIcon />
            </Link>
            {material.fileUrl ? (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={sourceLabel}
                aria-label={sourceLabel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ExternalLinkIcon />
              </a>
            ) : null}
            <button
              type="button"
              disabled={pinBusy}
              onClick={() => onTogglePin(material.id, isPinned)}
              title={pinLabel}
              aria-label={pinLabel}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isPinned
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:-translate-y-0.5 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
                  : "border-slate-200 bg-white/80 text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <PinAngleIcon filled={isPinned} className={isPinned ? "-rotate-[18deg]" : "text-slate-400 dark:text-slate-400"} />
            </button>
          </div>
        </div>

        {preview ? (
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{preview}</p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            No preview yet. Open the material to add more context.
          </p>
        )}

        {tags.length > 0 ? (
          <div className="border-t border-slate-200/70 pt-4 dark:border-slate-800">
            <TagList tags={tags} />
          </div>
        ) : null}
      </div>
    </li>
  );
}
