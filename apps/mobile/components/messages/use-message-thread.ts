import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import type { ConversationThreadResponse } from "./messages.types";

function getThreadQueryKey(conversationId: number) {
  return ["messages", "thread", conversationId] as const;
}

export function useMessageThread(conversationId: number) {
  const queryClient = useQueryClient();

  const threadQuery = useQuery({
    queryKey: getThreadQueryKey(conversationId),
    queryFn: async () =>
      apiFetch<ConversationThreadResponse>(
        `/api/conversations/${conversationId}/messages`,
        { cache: false }
      ),
    enabled: Number.isInteger(conversationId) && conversationId > 0,
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) =>
      apiFetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { content },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getThreadQueryKey(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: ["messages", "inbox"] });
    },
  });

  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      const trimmed = content.trim();
      if (!trimmed || sendMutation.isPending) {
        return null;
      }

      try {
        await sendMutation.mutateAsync(trimmed);
        return null;
      } catch (error) {
        return getUserFriendlyError(error, "Could not send message.");
      }
    },
    [sendMutation]
  );

  const refresh = useCallback(() => {
    void threadQuery.refetch();
  }, [threadQuery]);

  return {
    messages: threadQuery.data?.messages ?? [],
    otherUser: threadQuery.data?.other ?? null,
    loading: threadQuery.isPending && !threadQuery.data,
    refreshing: threadQuery.isRefetching && !threadQuery.isPending,
    error:
      threadQuery.error != null
        ? "Failed to load conversation."
        : null,
    isSending: sendMutation.isPending,
    sendMessage,
    refresh,
  };
}
