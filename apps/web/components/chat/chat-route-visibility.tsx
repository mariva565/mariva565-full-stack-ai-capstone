"use client";

import { usePathname } from "next/navigation";

import { ChatWidget } from "./chat-widget";

const HIDDEN_CHAT_ROUTES = new Set(["/login", "/register"]);

export function ChatRouteVisibility() {
  const pathname = usePathname();

  if (pathname && HIDDEN_CHAT_ROUTES.has(pathname)) {
    return null;
  }

  return <ChatWidget />;
}
