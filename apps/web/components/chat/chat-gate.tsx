import { getRequestUserOrNull } from "../../lib/server-auth";
import { ChatWidget } from "./chat-widget";

export async function ChatGate() {
  const user = await getRequestUserOrNull();
  if (!user) return null;
  return <ChatWidget />;
}
