import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type JwtPayload, verifyToken } from "./jwt";
import { db } from "./db";
import { users } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

export const getRequestUserOrNull = cache(async (): Promise<JwtPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  const [currentUser] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      blocked: users.blocked,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!currentUser || currentUser.blocked) {
    return null;
  }

  return {
    sub: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
  };
});

export async function getRequestUserOrRedirect(): Promise<JwtPayload> {
  const user = await getRequestUserOrNull();
  if (!user) {
    redirect("/login");
  }

  return user;
}
