import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { sql } from "drizzle-orm";

// Lightweight DB warmup probe — no auth required.
// Mobile client fires this in the background after auth to pre-warm the
// Neon serverless connection before the user triggers any mutations.
export async function GET() {
  const start = Date.now();
  await db.execute(sql`SELECT 1`);
  return NextResponse.json({ ok: true, latency: Date.now() - start });
}
