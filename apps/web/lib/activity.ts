import { db } from "./db";
import { activityLogs } from "../../../drizzle/schema";

export async function logActivity(
  userId: number,
  actionType: string,
  targetId?: number,
  details?: Record<string, unknown>
) {
  await db.insert(activityLogs).values({
    userId,
    actionType,
    targetId: targetId ?? null,
    details: details ?? null,
  });
}
