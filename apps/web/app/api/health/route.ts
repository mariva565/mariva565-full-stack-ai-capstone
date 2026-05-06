import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const checks: Record<string, string> = {};

  // Database
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "connected";
  } catch {
    checks.database = "error";
  }

  // Blob storage tokens
  checks.avatarBlob = process.env.AVATAR_BLOB_READ_WRITE_TOKEN?.trim()
    ? "configured"
    : "missing";
  checks.materialBlob = process.env.MATERIAL_BLOB_READ_WRITE_TOKEN?.trim()
    ? "configured"
    : "missing";

  // AI
  checks.ai = process.env.GEMINI_API_KEY?.trim()
    ? "configured"
    : "missing";

  // SMTP
  checks.email =
    process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()
      ? "configured"
      : "missing";

  const allGood =
    checks.database === "connected" &&
    checks.avatarBlob === "configured" &&
    checks.materialBlob === "configured";

  return NextResponse.json(
    {
      service: "studyhub-web-api",
      status: allGood ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allGood ? 200 : 503 }
  );
}
