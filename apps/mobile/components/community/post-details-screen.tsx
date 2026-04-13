import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch } from "../../lib/api";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { makeCommunityStyles } from "./community.styles";
import { BrandedSpinner } from "../branded-spinner";
import type { Post } from "./use-community-feed";

type Comment = {
  id: number;
  content: string;
  authorName: string | null;
  createdAt: string;
};

export function PostDetailsScreen({ postId }: { postId: number }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeCommunityStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");

  const query = useQuery({
    queryKey: ["community", "post", postId],
    queryFn: async () => {
      return apiFetch<{ post: Post; comments: Comment[] }>(`/api/posts/${postId}`, { cache: false });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const result = await apiFetch<{ liked: boolean }>(`/api/posts/${postId}/like`, { method: "POST" });
      return result.liked;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community", "post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const result = await apiFetch<{ comment: Comment }>(`/api/posts/${postId}/comments`, { 
        method: "POST", body: { content } 
      });
      return result.comment;
    },
    onSuccess: () => {
      setNewComment("");
      void queryClient.invalidateQueries({ queryKey: ["community", "post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
    }
  });

  const submitComment = () => {
    if (!newComment.trim() || commentMutation.isPending) return;
    commentMutation.mutate(newComment);
  };

  if (query.isPending) {
    return <View style={styles.container}><BrandedSpinner /></View>;
  }

  if (query.error || !query.data) {
    return (
      <View style={[styles.container, styles.emptyContainer, { paddingTop: 60 }]}>
        <Text style={styles.emptyTitle}>Post not found</Text>
      </View>
    );
  }

  const { post, comments } = query.data;

  const authorInitials = (post.authorName || "St").substring(0, 2).toUpperCase();
  const timeAgo = new Date(post.createdAt).toLocaleDateString();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, paddingTop: Math.max(insets.top + 12, 56), backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.borderMuted }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>Post Details</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: 88 + Math.max(insets.bottom, 12) }]}>
        {/* Post Card body */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{authorInitials}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{post.authorName || "Student"}</Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{post.postType}</Text>
          </View>
          <Text style={styles.cardTitle}>{post.title}</Text>
          <Text style={styles.cardBody}>{post.content}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.interactionRow}>
              <TouchableOpacity style={styles.interactionBtn} onPress={() => likeMutation.mutate()}>
                <Ionicons
                  name={post.isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={post.isLiked ? "#ef4444" : colors.textSecondary}
                />
                <Text style={styles.interactionBtnText}>{post.likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interactionBtn}>
                <Feather name="message-square" size={18} color={colors.textSecondary} />
                <Text style={styles.interactionBtnText}>{post.commentCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={{ ...styles.cardTitle, marginBottom: 16, marginTop: 8 }}>Comments ({comments.length})</Text>

        {comments.map((comment) => (
          <View key={comment.id} style={{ ...styles.card, padding: 12, shadowOpacity: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{ ...styles.avatar, width: 30, height: 30 }}>
                <Text style={{ ...styles.avatarInitials, fontSize: 12 }}>
                  {(comment.authorName || "St").substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={{ ...styles.authorName, fontSize: 14 }}>{comment.authorName || "Student"}</Text>
                <Text style={styles.timeAgo}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={styles.cardBody}>{comment.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Field */}
      <View style={{ flexDirection: "row", padding: 12, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.borderMuted }}>
        <TextInput
          style={{ flex: 1, backgroundColor: colors.canvas, color: colors.textPrimary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 }}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textMuted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          onPress={submitComment}
          disabled={!newComment.trim() || commentMutation.isPending}
          style={{ marginLeft: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: newComment.trim() ? colors.brandPrimary : colors.violetSoft, justifyContent: "center", alignItems: "center" }}
        >
          {commentMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={18} color={newComment.trim() ? "#fff" : colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
