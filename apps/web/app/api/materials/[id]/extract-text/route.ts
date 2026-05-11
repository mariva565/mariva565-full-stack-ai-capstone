import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { materials } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { getMaterialBlob } from "../../../../../lib/blob-storage";
import { db } from "../../../../../lib/db";
import { checkRateLimit } from "../../../../../lib/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

const MAX_EXTRACTED_LENGTH = 15000;

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ code, message }, { status });
}

function getMaterialBlobToken(): string {
  const token = process.env.MATERIAL_BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("MATERIAL_BLOB_READ_WRITE_TOKEN is not configured.");
  return token;
}

function getFileExtension(pathname: string): string {
  const lastDot = pathname.lastIndexOf(".");
  if (lastDot === -1) return "";
  return pathname.slice(lastDot + 1).toLowerCase();
}

async function fetchBlobBytes(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getMaterialBlobToken()}` },
  });

  if (!response.ok) {
    throw new Error(`Blob fetch failed with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text;
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  if (!checkRateLimit("extract-text", String(auth.user.sub), 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { code: "RATE_LIMITED", message: "Too many extraction requests. Try again in an hour." },
      { status: 429 },
    );
  }

  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isFinite(materialId) || materialId <= 0) {
    return jsonError("BAD_REQUEST", "Invalid material id", 400);
  }

  try {
    const [material] = await db
      .select({
        id: materials.id,
        fileUrl: materials.fileUrl,
        createdBy: materials.createdBy,
      })
      .from(materials)
      .where(eq(materials.id, materialId))
      .limit(1);

    if (!material) {
      return jsonError("NOT_FOUND", "Material not found", 404);
    }

    if (material.createdBy !== auth.user.sub) {
      return jsonError("FORBIDDEN", "You can only extract text from your own materials", 403);
    }

    const fileUrl = material.fileUrl?.trim();
    if (!fileUrl) {
      return jsonError("BAD_REQUEST", "No file attached to this material", 400);
    }

    const ext = getFileExtension(fileUrl);
    if (ext !== "pdf" && ext !== "docx" && ext !== "doc") {
      return jsonError(
        "BAD_REQUEST",
        "Text extraction is only supported for PDF and Word documents",
        400,
      );
    }

    const blob = await getMaterialBlob(fileUrl);
    if (!blob) {
      return jsonError("NOT_FOUND", "File not found in storage", 404);
    }

    const buffer = await fetchBlobBytes(blob.url);

    let text: string;
    if (ext === "pdf") {
      text = await extractTextFromPdf(buffer);
    } else {
      text = await extractTextFromDocx(buffer);
    }

    const trimmedText = text.trim().slice(0, MAX_EXTRACTED_LENGTH);
    if (!trimmedText) {
      return jsonError(
        "EMPTY_RESULT",
        "Could not extract any text from the file. The document might be scanned or image-based.",
        422,
      );
    }

    return NextResponse.json({ text: trimmedText });
  } catch (error) {
    console.error("Text extraction failed:", error);
    return jsonError("EXTRACTION_FAILED", "Failed to extract text from the file", 500);
  }
}
