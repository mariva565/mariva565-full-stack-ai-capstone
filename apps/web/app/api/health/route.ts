import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "studyhub-web-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
