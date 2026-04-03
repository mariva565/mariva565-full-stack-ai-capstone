/**
 * Convert a title string into a URL-safe slug.
 * Example: "Capstone Terminology and Issues" → "capstone-terminology-and-issues"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
