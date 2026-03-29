export const MATERIAL_TYPES = ["note", "link", "file"] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];
export type MaterialFilter = "all" | MaterialType;
export type MaterialSort = "newest" | "oldest" | "title";

const MATERIAL_TYPE_ALIASES: Record<string, MaterialType> = {
  note: "note",
  notes: "note",
  text: "note",
  link: "link",
  file: "file",
};

const TAG_SPLIT_REGEX = /[,;]/;

export function normalizeMaterialType(
  value: string | null | undefined
): MaterialType {
  if (!value) {
    return "note";
  }

  const normalized = MATERIAL_TYPE_ALIASES[value.trim().toLowerCase()];
  return normalized ?? "note";
}

export function materialTypeLabel(type: MaterialType): string {
  if (type === "file") {
    return "File";
  }

  if (type === "link") {
    return "Link";
  }

  return "Note";
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawTag of tags.split(TAG_SPLIT_REGEX)) {
    const trimmed = rawTag.trim();
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function serializeTags(tags: string[]): string | null {
  const normalizedTags = parseTags(tags.join(","));
  if (normalizedTags.length === 0) {
    return null;
  }

  return normalizedTags.join(", ");
}

export function prepareTagsFromInput(tagsInput: string): string | null {
  return serializeTags(parseTags(tagsInput));
}
