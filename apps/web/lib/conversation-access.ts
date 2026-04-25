import { and, eq } from "drizzle-orm";

import { conversationMembers } from "../../../drizzle/schema";
import { db } from "./db";

export async function isConversationMember(userId: number, conversationId: number) {
  const [membership] = await db
    .select({ id: conversationMembers.id })
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId)
      )
    )
    .limit(1);

  return !!membership;
}
