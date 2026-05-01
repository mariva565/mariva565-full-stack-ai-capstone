import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AVATAR_ALLOWED_MIME_TYPES, AVATAR_MAX_BYTES } from "./profile";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

type UploadAvatarParams = {
  userId: number;
  file: File;
};

function readR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucketName = process.env.R2_BUCKET_NAME?.trim() ?? "";
  const publicUrl = process.env.R2_PUBLIC_URL?.trim() ?? "";

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl,
  };
}

function requireR2Config(): R2Config {
  const config = readR2Config();
  if (!config) {
    throw new Error("Avatar uploads are unavailable because Cloudflare R2 is not configured.");
  }

  return config;
}

function getR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function buildPublicUrl(publicUrl: string, objectKey: string): string {
  const baseUrl = new URL(publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`);
  return new URL(objectKey, baseUrl).toString();
}

function getExtension(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number])) {
    return "Avatar must be a JPG, PNG, WebP, or GIF image.";
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return "Avatar must be 2 MB or smaller.";
  }

  return null;
}

export async function uploadAvatarFile({ userId, file }: UploadAvatarParams): Promise<string> {
  const config = requireR2Config();
  const client = getR2Client(config);
  const objectKey = `avatars/${userId}/${Date.now()}-${randomUUID()}.${getExtension(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return buildPublicUrl(config.publicUrl, objectKey);
}

export async function deleteAvatarByUrl(avatarUrl: string | null | undefined): Promise<void> {
  const objectKey = extractR2ObjectKey(avatarUrl);
  if (!objectKey) {
    return;
  }

  const config = readR2Config();
  if (!config) {
    return;
  }

  const client = getR2Client(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
    })
  );
}

export function extractR2ObjectKey(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) {
    return null;
  }

  const config = readR2Config();
  if (!config) {
    return null;
  }

  try {
    const baseUrl = new URL(config.publicUrl.endsWith("/") ? config.publicUrl : `${config.publicUrl}/`);
    const assetUrl = new URL(avatarUrl);
    if (baseUrl.origin !== assetUrl.origin) {
      return null;
    }

    const normalizedBasePath = baseUrl.pathname.replace(/\/+$/, "");
    const normalizedAssetPath = decodeURIComponent(assetUrl.pathname);

    if (
      normalizedBasePath &&
      normalizedAssetPath !== normalizedBasePath &&
      !normalizedAssetPath.startsWith(`${normalizedBasePath}/`)
    ) {
      return null;
    }

    return normalizedAssetPath.slice(normalizedBasePath.length).replace(/^\/+/, "") || null;
  } catch {
    return null;
  }
}

export function isR2Configured(): boolean {
  return readR2Config() !== null;
}

const UPLOAD_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

type UploadAllowedMimeType = (typeof UPLOAD_ALLOWED_MIME_TYPES)[number];

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const UPLOAD_MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB for photos/screenshots
const UPLOAD_MAX_DOC_BYTES   = 20 * 1024 * 1024; // 20 MB for PDF/Word

export function validateUploadFile(file: File): string | null {
  if (!UPLOAD_ALLOWED_MIME_TYPES.includes(file.type as UploadAllowedMimeType)) {
    return "Only images (JPG, PNG, WebP, GIF), PDF, and Word documents are allowed.";
  }
  const maxBytes = IMAGE_MIME_TYPES.has(file.type) ? UPLOAD_MAX_IMAGE_BYTES : UPLOAD_MAX_DOC_BYTES;
  if (file.size > maxBytes) {
    return IMAGE_MIME_TYPES.has(file.type)
      ? "Images must be 5 MB or smaller."
      : "Documents must be 20 MB or smaller.";
  }
  return null;
}

function getUploadExtension(contentType: string): string {
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

export async function uploadMaterialFile({
  userId,
  file,
}: {
  userId: number;
  file: File;
}): Promise<string> {
  const config = requireR2Config();
  const client = getR2Client(config);
  const objectKey = `materials/${userId}/${Date.now()}-${randomUUID()}.${getUploadExtension(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return buildPublicUrl(config.publicUrl, objectKey);
}
