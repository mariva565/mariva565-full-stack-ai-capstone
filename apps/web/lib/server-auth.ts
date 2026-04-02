import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type JwtPayload, verifyToken } from "./jwt";

export async function getRequestUserOrNull(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  return (await verifyToken(token)) ?? null;
}

export async function getRequestUserOrRedirect(): Promise<JwtPayload> {
  const user = await getRequestUserOrNull();
  if (!user) {
    redirect("/login");
  }

  return user;
}
