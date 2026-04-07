"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidget = dynamic(
  () => import("./chat-widget").then((m) => m.ChatWidget),
  { ssr: false }
);

const HIDDEN_CHAT_ROUTES = new Set(["/login", "/register"]);

export function ChatRouteVisibility() {
  const pathname = usePathname();

  if (pathname && HIDDEN_CHAT_ROUTES.has(pathname)) {
    return null;
  }

  return <ChatWidget />;
}
