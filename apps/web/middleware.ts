import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_PATHS = ["/", "/login", "/register", "/contact"];
const ADMIN_PATHS = ["/admin"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight for API routes
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // Allow public paths and API routes (API routes handle their own auth)
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    const response = NextResponse.next();
    if (pathname.startsWith("/api/")) {
      Object.entries(CORS_HEADERS).forEach(([k, v]) => response.headers.set(k, v));
    }
    return response;
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
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/courses/:path*",
    "/materials/:path*",
    "/modules/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/community/:path*",
    "/community",
    "/messages/:path*",
    "/messages",
    "/mentor-inbox/:path*",
    "/mentor-inbox",
    "/moderation/:path*",
    "/moderation",
    "/calendar/:path*",
    "/calendar",
    "/progress/:path*",
    "/progress",
  ],
};
