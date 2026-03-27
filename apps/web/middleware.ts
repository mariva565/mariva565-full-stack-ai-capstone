import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // Phase 0 placeholder. JWT route protection is implemented in Phase 2.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/materials/:path*", "/profile/:path*", "/admin/:path*"]
};
