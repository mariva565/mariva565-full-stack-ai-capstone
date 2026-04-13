import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "../../lib/app-preferences";

type PostCardProps = {
  post: any;
  styles: any;
  onPress?: () => void;
  onLike?: () => void;
};

export function PostCard({ post, styles, onPress, onLike }: PostCardProps) {
  const { colors } = useTheme();

  const authorInitials = (post.authorName || "St")
    .substring(0, 2)
    .toUpperCase();

  const date = new Date(post.createdAt);
  const timeAgo = date.toLocaleDateString();

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={!onPress}
    >
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
      <Text style={styles.cardBody} numberOfLines={3}>
        {post.content}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.interactionRow}>
          <TouchableOpacity style={styles.interactionBtn} onPress={onLike} disabled={!onLike}>
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={18}
              color={post.isLiked ? "#ef4444" : colors.textSecondary}
            />
            <Text style={styles.interactionBtnText}>{post.likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionBtn} onPress={onPress} disabled={!onPress}>
            <Feather name="message-square" size={18} color={colors.textSecondary} />
            <Text style={styles.interactionBtnText}>{post.commentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
