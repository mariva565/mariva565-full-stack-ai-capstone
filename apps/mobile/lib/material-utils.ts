import { COLORS, type AppColors } from "./colors";

export type MaterialType = "note" | "link" | "file";

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
};

export const MATERIAL_TYPE_OPTIONS = (Object.keys(MATERIAL_TYPE_CONFIG) as MaterialType[]).map(
  (key) => ({
    key,
    ...MATERIAL_TYPE_CONFIG[key],
  })
);

export function getMaterialTypeOptions(colors: AppColors = COLORS) {
  return (Object.keys(MATERIAL_TYPE_CONFIG) as MaterialType[]).map((key) => ({
    key,
    ...getMaterialTypeConfig(key, colors),
  }));
}

const URL_MATERIAL_TYPES: ReadonlySet<MaterialType> = new Set(["link", "file"]);
const IMAGE_FILE_EXTENSION_REGEX = /\.(avif|gif|jpe?g|png|webp)$/i;

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

export function isImageFileUrl(fileUrl: string | null | undefined): boolean {
  const trimmedUrl = fileUrl?.trim();
  if (!trimmedUrl) {
    return false;
  }

  let pathname = trimmedUrl;
  try {
    pathname = new URL(trimmedUrl).pathname;
  } catch {
    pathname = trimmedUrl.split(/[?#]/, 1)[0];
  }

  return IMAGE_FILE_EXTENSION_REGEX.test(pathname);
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
