export const POST_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const POST_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const POST_IMAGE_FILE_ACCEPT = POST_IMAGE_ALLOWED_MIME_TYPES.join(",");
export const MAX_POST_IMAGES = 3;

type PostImageMimeType = (typeof POST_IMAGE_ALLOWED_MIME_TYPES)[number];

export function isAllowedPostImageMimeType(type: string): type is PostImageMimeType {
  return POST_IMAGE_ALLOWED_MIME_TYPES.includes(type as PostImageMimeType);
}

export function countPostImages(html: string): number {
  return html.match(/<img\b[^>]*\bsrc\s*=/gi)?.length ?? 0;
}

export function hasPostImage(html: string): boolean {
  return countPostImages(html) > 0;
}

export function validatePostImageFile(file: File): string | null {
  if (!isAllowedPostImageMimeType(file.type)) {
    return "Post images must be JPG, PNG, WebP, or GIF files.";
  }
  if (file.size > POST_IMAGE_MAX_BYTES) {
    return "Post images must be 2 MB or smaller.";
  }
  return null;
}
