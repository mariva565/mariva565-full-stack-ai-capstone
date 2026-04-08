export const MATERIAL_TYPE_CONFIG: Record<
  string,
  { icon: string; label: string; color: string; bg: string }
> = {
  note: { icon: "📝", label: "Note", color: "#7c5ce7", bg: "#f0ecff" },
  link: { icon: "🔗", label: "Link", color: "#0ea5e9", bg: "#e0f2fe" },
  file: { icon: "📄", label: "File", color: "#f59e0b", bg: "#fef3c7" },
  video: { icon: "🎬", label: "Video", color: "#ef4444", bg: "#fef2f2" },
};

export function getMaterialTypeConfig(materialType: string) {
  return MATERIAL_TYPE_CONFIG[materialType] ?? MATERIAL_TYPE_CONFIG.note;
}

export function splitTags(tags: string | null | undefined) {
  if (!tags) {
    return [];
  }

  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
