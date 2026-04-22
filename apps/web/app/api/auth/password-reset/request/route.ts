import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../../../../drizzle/schema";
import { logActivity } from "../../../../../lib/activity";
import { sendPasswordResetEmail } from "../../../../../lib/email";
import { db } from "../../../../../lib/db";
import {
  checkResetRateLimit,
  createResetTokenForUser,
} from "../../../../../lib/password-reset";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function okResponse() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_EMAIL", message: "A valid email address is required." },
      { status: 400 }
    );
  }

  const rawEmail = (body as { email?: unknown }).email;
  if (typeof rawEmail !== "string" || !EMAIL_REGEX.test(rawEmail.trim())) {
    return NextResponse.json(
      { code: "INVALID_EMAIL", message: "A valid email address is required." },
      { status: 400 }
    );
  }

  const email = rawEmail.trim().toLowerCase();

  // Rate limit check — always return 200 even if throttled (anti-enumeration)
  if (!checkResetRateLimit(email)) {
    return okResponse();
  }

  // Look up user
  const [user] = await db
    .select({ id: users.id, name: users.name, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // No user or Google-only account (empty password_hash) → silent 200
  if (!user || !user.passwordHash) {
    return okResponse();
  }

  try {
    const plaintext = await createResetTokenForUser(user.id);
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${plaintext}`;

    await sendPasswordResetEmail({
      to: email,
      name: user.name,
      resetUrl,
    });

    await logActivity(user.id, "request_password_reset", user.id, {
      source: "forgot_password",
    });
  } catch (err) {
    console.error("[password-reset/request] Failed to send reset email:", err);
  }

  return okResponse();
}
