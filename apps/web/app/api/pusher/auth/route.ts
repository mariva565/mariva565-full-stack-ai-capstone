import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { conversationMembers } from "../../../../../../drizzle/schema";
import { requireAuth } from "../../../../lib/api-utils";
import { pusherServer } from "../../../../lib/pusher";
import { and, eq } from "drizzle-orm";

// POST /api/pusher/auth — authenticate user for private Pusher channels
// Pusher sends: socket_id, channel_name
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json(
      { code: "MISSING_PUSHER_AUTH_FIELDS", message: "Missing socket_id or channel_name" },
      { status: 400 }
    );
  }

  // Only allow private-conversation-{id} channels
  const match = channelName.match(/^private-conversation-(\d+)$/);
  if (!match) {
    return NextResponse.json(
      { code: "INVALID_PUSHER_CHANNEL", message: "Invalid channel" },
      { status: 403 }
    );
  }

  const conversationId = Number(match[1]);

  // Verify the user is a member of this conversation
  const [membership] = await db
    .select({ id: conversationMembers.id })
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, auth.user.sub)
      )
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Forbidden" },
      { status: 403 }
    );
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
