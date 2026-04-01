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
const TITLE_PREVIEW_MAX_LENGTH = 80;

function trimToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function shortenTitle(value: string): string {
  if (value.length <= TITLE_PREVIEW_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, TITLE_PREVIEW_MAX_LENGTH - 1).trimEnd()}...`;
}

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

export function resolveMaterialTitle(
  title: string | null | undefined,
  content: string | null | undefined,
  materialType: string | null | undefined,
  fileUrl: string | null | undefined
): string | null {
  const explicitTitle = trimToNull(title);
  if (explicitTitle) {
    return explicitTitle;
  }

  const firstLine = content
    ?.split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .find(Boolean);

  if (firstLine) {
    return shortenTitle(firstLine);
  }

  if (!trimToNull(fileUrl)) {
    return null;
  }

  return normalizeMaterialType(materialType) === "file" ? "Uploaded file" : "Saved link";
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
