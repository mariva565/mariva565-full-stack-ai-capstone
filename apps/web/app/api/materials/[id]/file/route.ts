import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { materials, sharedMaterials } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { getMaterialBlob } from "../../../../../lib/blob-storage";
import { db } from "../../../../../lib/db";
import {
  MATERIAL_FILE_LINK_QUERY_PARAM,
  verifyMaterialFileLinkToken,
} from "../../../../../lib/material-file-link-token";

type Ctx = { params: Promise<{ id: string }> };
type MaterialFileRecord = {
  id: number;
  fileUrl: string | null;
  createdBy: number;
};

export const runtime = "nodejs";

function jsonError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ code, message }, { status });
}

function isExternalUrl(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.startsWith("http://") || normalized.startsWith("https://");
}

function getMaterialBlobToken(): string {
  const token = process.env.MATERIAL_BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error("MATERIAL_BLOB_READ_WRITE_TOKEN is not configured.");
  }
  return token;
}

function getDownloadFilename(pathname: string, materialId: number): string {
  const fallback = `material-${materialId}`;
  const basename = pathname.split("/").filter(Boolean).pop() ?? fallback;
  let decoded = basename;

  try {
    decoded = decodeURIComponent(basename);
  } catch {
    decoded = basename;
  }

  const sanitized = decoded
    .replace(/[\x00-\x1F\x7F"\\]/g, "_")
    .trim();

  return sanitized || fallback;
}

function buildDownloadHeaders(
  blobResponse: Response,
  filename: string
): Headers {
  const headers = new Headers();
  const contentType =
    blobResponse.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = blobResponse.headers.get("content-length");

  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `inline; filename="${filename}"`);
  headers.set("Cache-Control", "private, no-store");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return headers;
}

async function canAccessMaterial(
  materialId: number,
  userId: number,
  ownerId: number
): Promise<boolean> {
  if (ownerId === userId) {
    return true;
  }

  const [share] = await db
    .select({ id: sharedMaterials.id })
    .from(sharedMaterials)
    .where(
      and(
        eq(sharedMaterials.materialId, materialId),
        eq(sharedMaterials.sharedWithUserId, userId)
      )
    )
    .limit(1);

  return !!share;
}

async function fetchPrivateBlob(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${getMaterialBlobToken()}`,
    },
  });
}

async function loadMaterialFileRecord(
  materialId: number
): Promise<MaterialFileRecord | null> {
  const [material] = await db
    .select({
      id: materials.id,
      fileUrl: materials.fileUrl,
      createdBy: materials.createdBy,
    })
    .from(materials)
    .where(eq(materials.id, materialId))
    .limit(1);

  return material ?? null;
}

async function getSignedFileLinkAccessError(
  request: NextRequest,
  materialId: number,
  pathname: string
): Promise<NextResponse | null> {
  const token = request.nextUrl.searchParams
    .get(MATERIAL_FILE_LINK_QUERY_PARAM)
    ?.trim();

  if (!token) {
    return null;
  }

  const payload = await verifyMaterialFileLinkToken(token);
  if (!payload || payload.materialId !== materialId || payload.pathname !== pathname) {
    return jsonError("INVALID_FILE_LINK", "Invalid or expired file link", 401);
  }

  return null;
}

async function getAuthenticatedAccessError(
  request: NextRequest,
  material: MaterialFileRecord
): Promise<NextResponse | null> {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const hasAccess = await canAccessMaterial(
    material.id,
    auth.user.sub,
    material.createdBy
  );
  if (!hasAccess) {
    return jsonError("FORBIDDEN", "You do not have access to this file", 403);
  }

  return null;
}

async function getAccessError(
  request: NextRequest,
  material: MaterialFileRecord,
  pathname: string
): Promise<NextResponse | null> {
  if (request.nextUrl.searchParams.has(MATERIAL_FILE_LINK_QUERY_PARAM)) {
    return getSignedFileLinkAccessError(request, material.id, pathname);
  }

  return getAuthenticatedAccessError(request, material);
}

async function buildBlobDownloadResponse(
  pathname: string,
  materialId: number
): Promise<Response | NextResponse> {
  const blob = await getMaterialBlob(pathname);
  if (!blob) {
    return jsonError("NOT_FOUND", "Material file not found", 404);
  }

  const blobResponse = await fetchPrivateBlob(blob.url);
  if (blobResponse.status === 404) {
    return jsonError("NOT_FOUND", "Material file not found", 404);
  }

  if (!blobResponse.ok || !blobResponse.body) {
    console.error("Material file download failed:", {
      materialId,
      status: blobResponse.status,
    });
    return jsonError("DOWNLOAD_FAILED", "File download failed", 500);
  }

  const filename = getDownloadFilename(blob.pathname, materialId);
  return new Response(blobResponse.body, {
    status: 200,
    headers: buildDownloadHeaders(blobResponse, filename),
  });
}

// GET /api/materials/:id/file
export async function GET(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isFinite(materialId) || materialId <= 0) {
    return jsonError("BAD_REQUEST", "Invalid material id", 400);
  }

  try {
    const material = await loadMaterialFileRecord(materialId);
    if (!material) {
      return jsonError("NOT_FOUND", "Material not found", 404);
    }

    const fileUrl = material.fileUrl?.trim();
    if (!fileUrl) {
      return jsonError("NOT_FOUND", "No file attached to this material", 404);
    }

    const accessError = await getAccessError(request, material, fileUrl);
    if (accessError) {
      return accessError;
    }

    if (isExternalUrl(fileUrl)) {
      return NextResponse.redirect(fileUrl);
    }

    return buildBlobDownloadResponse(fileUrl, material.id);
  } catch (error) {
    console.error("Material file download failed:", error);
    return jsonError("DOWNLOAD_FAILED", "File download failed", 500);
  }
}
