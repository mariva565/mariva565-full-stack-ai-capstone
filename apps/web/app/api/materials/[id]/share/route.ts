import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { users, materials } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { sendShareNotification } from "../../../../../lib/email";
import { eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/materials/:id/share
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isFinite(materialId) || materialId <= 0) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid material id" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const recipientEmail: string =
    typeof body.recipientEmail === "string"
      ? body.recipientEmail.trim().toLowerCase()
      : "";

  if (!recipientEmail) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "recipientEmail is required" },
      { status: 400 }
    );
  }

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, materialId));

  if (!material) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found" },
      { status: 404 }
    );
  }

  const [recipient] = await db
    .select()
    .from(users)
    .where(eq(users.email, recipientEmail));

  if (!recipient) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "No StudyHub user with that email" },
      { status: 404 }
    );
  }

  if (recipient.id === auth.user.sub) {
    return NextResponse.json(
      { code: "SELF_SHARE", message: "Cannot share with yourself" },
      { status: 400 }
    );
  }

  const [sender] = await db
    .select()
    .from(users)
    .where(eq(users.id, auth.user.sub));

  const senderName = sender?.name ?? "Потребител";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const materialUrl = `${appUrl}/materials/${materialId}`;

  try {
    await sendShareNotification({
      to: recipient.email,
      senderName,
      materialTitle: material.title,
      materialType: material.materialType as
        | "note"
        | "file"
        | "link"
        | "material",
      materialUrl,
    });
  } catch (error) {
    console.error("Share notification failed:", error);
    return NextResponse.json(
      { code: "EMAIL_FAILED", message: "Could not send email notification" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
