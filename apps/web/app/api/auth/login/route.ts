import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { verifyPassword } from "../../../../lib/auth";
import { signToken } from "../../../../lib/jwt";
import { normalizeEmail } from "../../../../lib/email-validation";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const normalizedEmail = normalizeEmail(email);
    const ip = getClientIp(request);

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Email and password are required" },
        { status: 400 }
      );
    }

    const withinIpLimit = checkRateLimit("login-ip", ip, 20, 15 * 60 * 1000);
    const withinEmailLimit = checkRateLimit(
      "login-email",
      normalizedEmail,
      5,
      15 * 60 * 1000
    );

    if (!withinIpLimit || !withinEmailLimit) {
      return NextResponse.json(
        {
          code: "RATE_LIMITED",
          message: "Too many login attempts. Try again in 15 minutes.",
        },
        { status: 429 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Hmm, those details don't match. Try again?" },
        { status: 401 }
      );
    }

    if (user.blocked) {
      return NextResponse.json(
        { code: "ACCOUNT_BLOCKED", message: "This account is blocked" },
        { status: 403 }
      );
    }

    // Sign JWT
    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Something went wrong" },
      { status: 500 }
    );
  }
}
