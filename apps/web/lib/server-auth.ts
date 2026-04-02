import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type JwtPayload, verifyToken } from "./jwt";

export async function getRequestUserOrRedirect(): Promise<JwtPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await verifyToken(token);
  if (!user) {
    redirect("/login");
  }

  return user;
}
