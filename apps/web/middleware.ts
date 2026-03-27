import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_PATHS = ["/", "/login", "/register", "/contact"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes (API routes handle their own auth)
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // Check JWT from cookie
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // Admin-only paths
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/materials/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
