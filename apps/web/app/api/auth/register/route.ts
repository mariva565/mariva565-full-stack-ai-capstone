import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { hashPassword } from "../../../../lib/auth";
import { signToken } from "../../../../lib/jwt";
import { isValidEmail, normalizeEmail } from "../../../../lib/email-validation";
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from "../../../../lib/password-validation";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
    const ip = getClientIp(request);

    // Validate input
    if (!normalizedEmail || !normalizedName || !password) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Email, name and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { code: "INVALID_EMAIL", message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (!checkRateLimit("register", ip, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        {
          code: "RATE_LIMITED",
          message: "Too many accounts from this IP. Try again later.",
        },
        { status: 429 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { code: "WEAK_PASSWORD", message: PASSWORD_POLICY_MESSAGE },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { code: "EMAIL_EXISTS", message: "This email already has an account — maybe you want to sign in? 👋" },
        { status: 409 }
      );
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: normalizedName,
        passwordHash: hashPassword(password),
        role: "user",
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    // Sign JWT
    const token = await signToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Set cookie and return (token also in body for mobile clients)
    const response = NextResponse.json(
      { message: "Registration successful", token, user: { id: newUser.id, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
