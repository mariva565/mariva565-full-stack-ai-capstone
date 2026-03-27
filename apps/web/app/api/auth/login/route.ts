import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { verifyPassword } from "../../../../lib/auth";
import { signToken } from "../../../../lib/jwt";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        { status: 401 }
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
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
