import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "../../../../lib/api-utils";

const LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB Vercel Hobby

async function sumStoreBytes(token: string): Promise<number> {
  let total = 0;
  let cursor: string | undefined;

  do {
    const result = await list({ token, cursor, limit: 1000 });
    for (const blob of result.blobs) {
      total += blob.size;
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return total;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const avatarToken = process.env.AVATAR_BLOB_READ_WRITE_TOKEN ?? "";
  const materialToken = process.env.MATERIAL_BLOB_READ_WRITE_TOKEN ?? "";

  const [avatarBytes, materialBytes] = await Promise.all([
    avatarToken ? sumStoreBytes(avatarToken) : Promise.resolve(0),
    materialToken ? sumStoreBytes(materialToken) : Promise.resolve(0),
  ]);

  const usedBytes = avatarBytes + materialBytes;

  return NextResponse.json({
    usedBytes,
    limitBytes: LIMIT_BYTES,
    percent: Math.min(100, (usedBytes / LIMIT_BYTES) * 100),
    breakdown: { avatarBytes, materialBytes },
  });
}
