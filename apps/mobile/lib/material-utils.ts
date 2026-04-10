import { COLORS, type AppColors } from "./colors";

export type MaterialType = "note" | "link" | "file" | "video";

type MaterialTypeVisualConfig = {
  icon: string;
  label: string;
  color: string;
  bg: string;
};

export const DEFAULT_MATERIAL_TYPE: MaterialType = "note";

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, MaterialTypeVisualConfig> = {
  note: { icon: "\u{1F4DD}", label: "Note", color: COLORS.brandAccent, bg: COLORS.violetSoft },
  link: { icon: "\u{1F517}", label: "Link", color: COLORS.link, bg: COLORS.linkSoft },
  file: { icon: "\u{1F4C4}", label: "File", color: COLORS.warning, bg: COLORS.warningSoft },
  video: { icon: "\u{1F3AC}", label: "Video", color: COLORS.dangerAccent, bg: COLORS.dangerSoftAlt },
};

export const MATERIAL_TYPE_OPTIONS = (Object.keys(MATERIAL_TYPE_CONFIG) as MaterialType[]).map(
  (key) => ({
    key,
    ...MATERIAL_TYPE_CONFIG[key],
  })
);

const URL_MATERIAL_TYPES: ReadonlySet<MaterialType> = new Set(["link", "file", "video"]);

export function isMaterialType(value: string): value is MaterialType {
  return value in MATERIAL_TYPE_CONFIG;
}

export function normalizeMaterialType(value: string | null | undefined): MaterialType {
  if (!value) {
    return DEFAULT_MATERIAL_TYPE;
  }

  return isMaterialType(value) ? value : DEFAULT_MATERIAL_TYPE;
}

export function isUrlMaterialType(value: string): boolean {
  if (!isMaterialType(value)) {
    return false;
  }

  return URL_MATERIAL_TYPES.has(value);
}

export function getMaterialTypeConfig(
  materialType: string,
  colors: AppColors = COLORS
): MaterialTypeVisualConfig {
  const type = normalizeMaterialType(materialType);

  switch (type) {
    case "note":
      return { icon: "\u{1F4DD}", label: "Note", color: colors.brandAccent, bg: colors.violetSoft };
    case "link":
      return { icon: "\u{1F517}", label: "Link", color: colors.link, bg: colors.linkSoft };
    case "file":
      return { icon: "\u{1F4C4}", label: "File", color: colors.warning, bg: colors.warningSoft };
    case "video":
      return { icon: "\u{1F3AC}", label: "Video", color: colors.dangerAccent, bg: colors.dangerSoftAlt };
    default:
      return MATERIAL_TYPE_CONFIG.note;
  }
}

export function splitTags(tags: string | null | undefined): string[] {
  if (!tags) {
    return [];
  }

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
