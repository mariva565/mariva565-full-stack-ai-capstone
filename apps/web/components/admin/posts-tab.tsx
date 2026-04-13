"use client";

import { ModerationQueue } from "../moderation/moderation-queue";

export function PostsTab() {
  return <ModerationQueue role="admin" embedded />;
}

