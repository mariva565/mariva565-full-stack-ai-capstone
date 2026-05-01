import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/api-utils";
import { uploadMaterialFile, validateUploadFile } from "../../../lib/r2";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileEntry = (formData as any).get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { code: "MISSING_FILE", message: "No file provided." },
      { status: 400 }
    );
  }

  const validationMessage = validateUploadFile(fileEntry);
  if (validationMessage) {
    return NextResponse.json(
      { code: "INVALID_FILE", message: validationMessage },
      { status: 400 }
    );
  }

  try {
    const url = await uploadMaterialFile({
      userId: auth.user.sub,
      file: fileEntry,
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json(
      { code: "UPLOAD_FAILED", message },
      { status: 500 }
    );
  }
}
