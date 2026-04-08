export type MaterialType = "note" | "link" | "file" | "video";

type MaterialTypeVisualConfig = {
  icon: string;
  label: string;
  color: string;
  bg: string;
};

export const DEFAULT_MATERIAL_TYPE: MaterialType = "note";

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, MaterialTypeVisualConfig> = {
  note: { icon: "\u{1F4DD}", label: "Note", color: "#7c5ce7", bg: "#f0ecff" },
  link: { icon: "\u{1F517}", label: "Link", color: "#0ea5e9", bg: "#e0f2fe" },
  file: { icon: "\u{1F4C4}", label: "File", color: "#f59e0b", bg: "#fef3c7" },
  video: { icon: "\u{1F3AC}", label: "Video", color: "#ef4444", bg: "#fef2f2" },
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

export function getMaterialTypeConfig(materialType: string): MaterialTypeVisualConfig {
  const type = normalizeMaterialType(materialType);
  return MATERIAL_TYPE_CONFIG[type];
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

