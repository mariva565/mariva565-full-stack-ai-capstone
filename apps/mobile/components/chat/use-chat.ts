import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { useToast } from "../../lib/toast-context";
import type { ChatMessage } from "../../lib/studyhub-types";

export function useChat() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiFetch<{ reply: string }>("/api/ai/chat", {
        method: "POST",
        body: { message: messageText, history: messages },
        timeoutMs: 30000,
      });
      return response.reply;
    },
    onSuccess: (replyText) => {
      setMessages((prev) => [...prev, { role: "model", parts: replyText }]);
    },
    onError: (err) => {
      // Revert the optimistic user message to prevent [user, user] corruption
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "user") {
          return prev.slice(0, -1);
        }
        return prev;
      });
      showToast(getUserFriendlyError(err, "Failed to send message"), "error");
    },
  });

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // Add optimistic user message
    setMessages((prev) => [...prev, { role: "user", parts: trimmed }]);
    
    await chatMutation.mutateAsync(trimmed).catch(() => {
      // handled in onError
    });
  };

  return {
    messages,
    sendMessage,
    isTyping: chatMutation.isPending,
  };
}
