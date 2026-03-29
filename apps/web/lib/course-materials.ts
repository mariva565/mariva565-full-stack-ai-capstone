import {
  normalizeMaterialType,
  parseTags,
  type MaterialFilter,
  type MaterialSort,
} from "./materials";

export type CourseMaterial = {
  id: number;
  title: string;
  materialType: string;
  content: string | null;
  fileUrl: string | null;
  tags: string | null;
  createdAt: string;
};

export const FILTER_OPTIONS: { value: MaterialFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "link", label: "Links" },
  { value: "file", label: "Files" },
];

export const SORT_OPTIONS: { value: MaterialSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A-Z)" },
];

export function matchesSearch(material: CourseMaterial, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  const inTitle = material.title.toLowerCase().includes(normalizedQuery);
  const inContent = (material.content ?? "").toLowerCase().includes(normalizedQuery);
  const inTags = parseTags(material.tags).some((tag) =>
    tag.toLowerCase().includes(normalizedQuery)
  );

  return inTitle || inContent || inTags;
}

export function matchesFilter(
  material: CourseMaterial,
  filter: MaterialFilter
): boolean {
  if (filter === "all") {
    return true;
  }

  return normalizeMaterialType(material.materialType) === filter;
}

export function sortMaterials(
  materials: CourseMaterial[],
  sortBy: MaterialSort
): CourseMaterial[] {
  const sorted = [...materials];

  if (sortBy === "title") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sorted.sort((a, b) => {
    const left = new Date(a.createdAt).getTime();
    const right = new Date(b.createdAt).getTime();
    return sortBy === "newest" ? right - left : left - right;
  });
}
