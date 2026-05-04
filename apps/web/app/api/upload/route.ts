import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/api-utils";
import { uploadMaterialBlob, validateMaterialBlob } from "../../../lib/blob-storage";

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

  const validationMessage = validateMaterialBlob(fileEntry);
  if (validationMessage) {
    return NextResponse.json(
      { code: "INVALID_FILE", message: validationMessage },
      { status: 400 }
    );
  }

  try {
    const pathname = await uploadMaterialBlob({
      userId: auth.user.sub,
      file: fileEntry,
    });
    // Return pathname as `url` — client stores it in materials.file_url.
    // Never expose the full private Blob URL.
    return NextResponse.json({ url: pathname });
  } catch (error) {
    console.error("Material upload failed:", error);
    return NextResponse.json(
      { code: "UPLOAD_FAILED", message: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
