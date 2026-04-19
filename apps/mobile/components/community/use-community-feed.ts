import { useFocusEffect } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiFetch } from "../../lib/api";

export type Post = {
  id: number;
  title: string;
  content: string;
  authorId?: number;
  authorName: string | null;
  authorAvatarUrl?: string | null;
  postType: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked: boolean;
};

export function useCommunityFeed() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["community", "feed"],
    queryFn: async () => {
      const resp = await apiFetch<{ posts: Post[] }>("/api/posts?page=1", { cache: false });
      return resp.posts;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const result = await apiFetch<{ liked: boolean }>(`/api/posts/${postId}/like`, { method: "POST" });
      return { postId, liked: result.liked };
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["community", "feed"] });
      const previous = queryClient.getQueryData<Post[]>(["community", "feed"]);
      
      queryClient.setQueryData<Post[]>(["community", "feed"], (old) => {
        if (!old) return old;
        return old.map(p => 
          p.id === postId 
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        );
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["community", "feed"], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
    }
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
    }, [queryClient])
  );

  const refresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    posts: query.data ?? [],
    loading: query.isPending && (query.data ?? []).length === 0,
    refreshing: query.isRefetching && !query.isPending,
    error: query.error ? "Failed to load community feed" : null,
    refresh,
    toggleLike: (postId: number) => likeMutation.mutate(postId),
  };
}
