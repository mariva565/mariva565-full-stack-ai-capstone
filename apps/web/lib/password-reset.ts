import crypto from "crypto";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "./db";
import { passwordResetTokens } from "../../../drizzle/schema";

// === CONFIGURATION ===
export const PASSWORD_RESET_TTL_HOURS = 1;
export const PASSWORD_RESET_TTL_MS = PASSWORD_RESET_TTL_HOURS * 60 * 60 * 1000;
export const RESET_REQUEST_RATE_LIMIT = 3;
export const RESET_REQUEST_RATE_WINDOW_MS = 60 * 60 * 1000;

// In-memory rate limit store: email → list of request timestamps
const rateLimitStore = new Map<string, number[]>();

export function hashToken(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}

export function generateResetToken(): { plaintext: string; hash: string } {
  const bytes = crypto.randomBytes(32);
  const plaintext = bytes.toString("base64url");
  const hash = hashToken(plaintext);
  return { plaintext, hash };
}

export async function createResetTokenForUser(userId: number): Promise<string> {
  const { plaintext, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  // Invalidate any prior unused tokens for this user
  await db
    .delete(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, userId),
        isNull(passwordResetTokens.usedAt)
      )
    );

  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash: hash,
    expiresAt,
  });

  return plaintext;
}

export async function consumeResetToken(
  plaintext: string
): Promise<{ userId: number } | null> {
  const hash = hashToken(plaintext);
  const now = new Date();

  const [token] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!token) {
    return null;
  }

  // Mark as used atomically
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, token.id));

  return { userId: token.userId };
}

/**
 * Returns true if the email is within rate limit, false if over limit.
 * Trims old entries on each call.
 */
export function checkResetRateLimit(email: string): boolean {
  const key = email.toLowerCase();
  const now = Date.now();
  const windowStart = now - RESET_REQUEST_RATE_WINDOW_MS;

  const timestamps = (rateLimitStore.get(key) ?? []).filter(
    (ts) => ts > windowStart
  );

  if (timestamps.length >= RESET_REQUEST_RATE_LIMIT) {
    rateLimitStore.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return true;
}
