import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { materials, sharedMaterials } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { getMaterialBlob } from "../../../../../lib/blob-storage";
import { db } from "../../../../../lib/db";
import {
  MATERIAL_FILE_LINK_EXPIRES_IN_SECONDS,
  MATERIAL_FILE_LINK_QUERY_PARAM,
  signMaterialFileLinkToken,
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

function buildSignedFileUrl(
  request: NextRequest,
  materialId: number,
  token: string
): string {
  const url = new URL(`/api/materials/${materialId}/file`, request.url);
  url.searchParams.set(MATERIAL_FILE_LINK_QUERY_PARAM, token);
  return url.toString();
}

// POST /api/materials/:id/file-link
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

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

    const hasAccess = await canAccessMaterial(
      material.id,
      auth.user.sub,
      material.createdBy
    );
    if (!hasAccess) {
      return jsonError("FORBIDDEN", "You do not have access to this file", 403);
    }

    const fileUrl = material.fileUrl?.trim();
    if (!fileUrl) {
      return jsonError("NOT_FOUND", "No file attached to this material", 404);
    }

    if (isExternalUrl(fileUrl)) {
      return jsonError(
        "UNSUPPORTED_FILE_SOURCE",
        "Signed file links are only available for private material files",
        400
      );
    }

    const blob = await getMaterialBlob(fileUrl);
    if (!blob) {
      return jsonError("NOT_FOUND", "Material file not found", 404);
    }

    const token = await signMaterialFileLinkToken({
      materialId: material.id,
      pathname: blob.pathname,
    });

    return NextResponse.json({
      url: buildSignedFileUrl(request, material.id, token),
      expiresIn: MATERIAL_FILE_LINK_EXPIRES_IN_SECONDS,
    });
  } catch (error) {
    console.error("Material file link creation failed:", error);
    return jsonError("FILE_LINK_FAILED", "Could not create file link", 500);
  }
}
