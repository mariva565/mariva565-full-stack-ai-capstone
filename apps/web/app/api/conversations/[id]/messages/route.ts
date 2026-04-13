import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import {
  conversationMembers,
  messages,
  users,
} from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { pusherServer } from "../../../../../lib/pusher";
import { and, eq, asc, inArray } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// Verify current user is a member of the conversation
async function requireMember(userId: number, conversationId: number) {
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

// GET /api/conversations/[id]/messages — full message history + other participant
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const conversationId = Number(id);
  const userId = auth.user.sub;

  const isMember = await requireMember(userId, conversationId);
  if (!isMember) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const [rows, members] = await Promise.all([
    db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderAvatar: users.avatarUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt)),
    db
      .select({ userId: conversationMembers.userId, name: users.name, avatarUrl: users.avatarUrl })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, conversationId)),
  ]);

  const other = members.find((m) => m.userId !== userId) ?? null;

  return NextResponse.json({
    messages: rows,
    other: other ? { id: other.userId, name: other.name, avatarUrl: other.avatarUrl } : null,
  });
}

// POST /api/conversations/[id]/messages — send a message + Pusher trigger
// Body: { content: string }
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const conversationId = Number(id);

  const isMember = await requireMember(auth.user.sub, conversationId);
  if (!isMember) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ message: "Content is required" }, { status: 400 });
  }

  const [msg] = await db
    .insert(messages)
    .values({ conversationId, senderId: auth.user.sub, content })
    .returning();

  // Fetch sender name for Pusher payload
  const [sender] = await db
    .select({ name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  // Trigger Pusher event on private channel
  await pusherServer.trigger(
    `private-conversation-${conversationId}`,
    "new-message",
    {
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      senderName: sender?.name ?? "",
      senderAvatar: sender?.avatarUrl ?? null,
    }
  );

  return NextResponse.json(msg, { status: 201 });
}
