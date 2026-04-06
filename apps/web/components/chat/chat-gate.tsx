import { getRequestUserOrNull } from "../../lib/server-auth";
import { ChatRouteVisibility } from "./chat-route-visibility";

export async function ChatGate() {
  const user = await getRequestUserOrNull();
  if (!user) return null;
  return <ChatRouteVisibility />;
}
