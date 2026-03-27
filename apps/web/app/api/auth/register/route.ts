import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { hashPassword } from "../../../../lib/auth";
import { signToken } from "../../../../lib/jwt";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Email, name and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { code: "WEAK_PASSWORD", message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { code: "EMAIL_EXISTS", message: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
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

    // Set cookie and return
    const response = NextResponse.json(
      { message: "Registration successful", user: { id: newUser.id, email: newUser.email, role: newUser.role } },
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
