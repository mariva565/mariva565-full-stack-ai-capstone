import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../../../../drizzle/schema";
import { logActivity } from "../../../../../lib/activity";
import { hashPassword } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";
import { consumeResetToken } from "../../../../../lib/password-reset";

export const runtime = "nodejs";

type ConfirmPayload = {
  token?: unknown;
  newPassword?: unknown;
};

export async function POST(request: NextRequest) {
  let body: ConfirmPayload;
  try {
    body = (await request.json()) as ConfirmPayload;
  } catch {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { token, newPassword } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "Reset token is required." },
      { status: 400 }
    );
  }

  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 6
  ) {
    return NextResponse.json(
      {
        code: "INVALID_PASSWORD",
        message: "New password must be at least 6 characters.",
      },
      { status: 400 }
    );
  }

  const result = await consumeResetToken(token);
  if (!result) {
    return NextResponse.json(
      {
        code: "INVALID_TOKEN",
        message: "This reset link is invalid or has expired.",
      },
      { status: 400 }
    );
  }

  const { userId } = result;

  await db
    .update(users)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(users.id, userId));

  await logActivity(userId, "reset_password", userId, {
    source: "email_link",
  });

  return NextResponse.json({ ok: true });
}
