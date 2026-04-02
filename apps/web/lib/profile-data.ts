import { eq } from "drizzle-orm";
import { cache } from "react";

import { users } from "../../../drizzle/schema";
import type { ProfileUser } from "./profile";
import { db } from "./db";

type ProfileUserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date | string;
};

export function getProfileUserSelection() {
  return {
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    avatarUrl: users.avatarUrl,
    createdAt: users.createdAt,
  };
}

export function normalizeProfileUser(user: ProfileUserRow): ProfileUser {
  return {
    ...user,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: typeof user.createdAt === "string" ? user.createdAt : user.createdAt.toISOString(),
  };
}

export const getProfileUserById = cache(async (userId: number): Promise<ProfileUser | null> => {
  const [user] = await db
    .select(getProfileUserSelection())
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ? normalizeProfileUser(user) : null;
});
