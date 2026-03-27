import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JwtPayload } from "./jwt";

/**
 * Extract and verify the JWT from request cookies.
 * Returns the payload or a 401 response.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JwtPayload } | { error: NextResponse }> {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { code: "NOT_AUTHENTICATED", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      error: NextResponse.json(
        { code: "INVALID_TOKEN", message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  return { user: payload };
}

/**
 * Require admin role. Call after requireAuth.
 */
export function requireAdmin(user: JwtPayload): NextResponse | null {
  if (user.role !== "admin") {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Admin access required" },
      { status: 403 }
    );
  }
  return null;
}
