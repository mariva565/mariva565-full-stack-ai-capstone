import { randomUUID } from "crypto";
import { put, del, list, type ListBlobResultBlob } from "@vercel/blob";
import { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from "./profile";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MATERIAL_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type MaterialAllowedMimeType = (typeof MATERIAL_ALLOWED_MIME_TYPES)[number];

const MATERIAL_MAX_BYTES = 3 * 1024 * 1024; // 3 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireToken(envVar: string): string {
  const token = process.env[envVar]?.trim();
  if (!token) {
    throw new Error(`File uploads are unavailable because ${envVar} is not configured.`);
  }
  return token;
}

function mimeToExt(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  };
  return map[contentType] ?? "bin";
}

function buildPathname(prefix: string, userId: number, contentType: string): string {
  return `${prefix}/${userId}/${Date.now()}-${randomUUID()}.${mimeToExt(contentType)}`;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateAvatarBlob(file: File): string | null {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number])) {
    return "Avatar must be a JPG, PNG, WebP, or GIF image.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "Avatar must be 2 MB or smaller.";
  }
  return null;
}

export function validateMaterialBlob(file: File): string | null {
  if (!MATERIAL_ALLOWED_MIME_TYPES.includes(file.type as MaterialAllowedMimeType)) {
    return "Only images (JPG, PNG, WebP, GIF), PDF, and Word documents are allowed.";
  }
  if (file.size > MATERIAL_MAX_BYTES) {
    return "Material files must be 3 MB or smaller.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Avatar — public store
// ---------------------------------------------------------------------------

export async function uploadAvatarBlob({
  userId,
  file,
}: {
  userId: number;
  file: File;
}): Promise<string> {
  const token = requireToken("AVATAR_BLOB_READ_WRITE_TOKEN");
  const pathname = buildPathname("avatars", userId, file.type);

  const blob = await put(pathname, file, {
    access: "public",
    token,
    contentType: file.type,
    cacheControlMaxAge: 31_536_000, // 1 year
    addRandomSuffix: false,
  });

  return blob.url;
}

export async function deleteAvatarBlob(url: string | null | undefined): Promise<void> {
  if (!url) return;

  const token = process.env.AVATAR_BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return;

  try {
    await del(url, { token });
  } catch {
    // Best-effort deletion — do not throw if the blob is already gone.
  }
}

// ---------------------------------------------------------------------------
// Material — private store (returns pathname only, never public URL)
// ---------------------------------------------------------------------------

export async function uploadMaterialBlob({
  userId,
  file,
}: {
  userId: number;
  file: File;
}): Promise<string> {
  const token = requireToken("MATERIAL_BLOB_READ_WRITE_TOKEN");
  const pathname = buildPathname("materials", userId, file.type);

  await put(pathname, file, {
    access: "private",
    token,
    contentType: file.type,
    addRandomSuffix: false,
  });

  // Return only the pathname — never expose the full Blob URL to clients.
  return pathname;
}

export async function getMaterialBlob(
  pathname: string
): Promise<ListBlobResultBlob | null> {
  const normalizedPathname = pathname.trim();
  if (!normalizedPathname) {
    return null;
  }

  const token = requireToken("MATERIAL_BLOB_READ_WRITE_TOKEN");
  const result = await list({
    prefix: normalizedPathname,
    token,
    limit: 1,
  });

  return result.blobs.find((blob) => blob.pathname === normalizedPathname) ?? null;
}

// ---------------------------------------------------------------------------
// URL validation (for PUT /api/auth/me avatar URL origin check)
// ---------------------------------------------------------------------------

export function isValidAvatarBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Token availability checks
// ---------------------------------------------------------------------------

export function isAvatarBlobConfigured(): boolean {
  return !!process.env.AVATAR_BLOB_READ_WRITE_TOKEN?.trim();
}

export function isMaterialBlobConfigured(): boolean {
  return !!process.env.MATERIAL_BLOB_READ_WRITE_TOKEN?.trim();
}
