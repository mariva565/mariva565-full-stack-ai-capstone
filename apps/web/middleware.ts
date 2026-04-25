import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

const PUBLIC_PATHS = ["/", "/login", "/register", "/contact"];
const ADMIN_PATHS = ["/admin"];

const CORS_ENABLED_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/auth/google",
  "/api/auth/password-reset/",
  "/api/courses",
  "/api/modules",
  "/api/materials",
  "/api/favorites",
  "/api/posts",
  "/api/conversations",
  "/api/mobile/push-token",
];

function isCorsEnabledApiPath(pathname: string) {
  return CORS_ENABLED_API_PREFIXES.some((prefix) =>
    prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function getCorsHeaders(request: NextRequest, pathname: string) {
  if (!pathname.startsWith("/api/") || !isCorsEnabledApiPath(pathname)) {
    return null;
  }

  const origin = request.headers.get("origin")?.trim();
  if (!origin) {
    return null;
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!allowedOrigins.includes(origin)) {
    return null;
  }

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Vary", "Origin");

  return headers;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const corsHeaders = getCorsHeaders(request, pathname);

  // Handle CORS preflight for API routes
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders ?? undefined });
  }

  // Allow public paths and API routes (API routes handle their own auth)
  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    const response = NextResponse.next();
    if (corsHeaders) {
      corsHeaders.forEach((value, key) => response.headers.set(key, value));
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
    "/dashboard",
    "/courses/:path*",
    "/courses",
    "/materials/:path*",
    "/materials",
    "/modules/:path*",
    "/modules",
    "/profile/:path*",
    "/profile",
    "/admin/:path*",
    "/admin",
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
