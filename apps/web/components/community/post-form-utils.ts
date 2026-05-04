import { countPostImages, hasPostImage, MAX_POST_IMAGES } from "@/lib/post-images";

export function hasPostFormContent(content: string): boolean {
  const plainContent = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim();
  return plainContent.length > 0 || hasPostImage(content);
}

export function validatePostFormImages(content: string): string | null {
  if (countPostImages(content) > MAX_POST_IMAGES) {
    return `You can add up to ${MAX_POST_IMAGES} images per post.`;
  }

  return null;
}
