import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";
import type { ConversationListItem } from "./messages.types";

const INBOX_QUERY_KEY = ["messages", "inbox"] as const;

export function useMessagesInbox() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: INBOX_QUERY_KEY,
    queryFn: async () =>
      apiFetch<ConversationListItem[]>("/api/conversations", { cache: false }),
    refetchInterval: 15000,
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: INBOX_QUERY_KEY });
    }, [queryClient])
  );

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    conversations: query.data ?? [],
    loading: query.isPending && (query.data ?? []).length === 0,
    refreshing: query.isRefetching && !query.isPending,
    error: query.error ? "Failed to load conversations." : null,
    refresh,
  };
}
