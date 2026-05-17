import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { makeCommunityStyles } from "./community.styles";
import {
  type CommunityPostTypeFilter,
  useCommunityFeed,
} from "./use-community-feed";
import { PostCard } from "./post-card";
import { BrandedSpinner } from "../branded-spinner";
import { useMessagesInbox } from "../messages/use-messages-inbox";
import { CommunityGradientTitle } from "./community-gradient-title";

const FILTER_OPTIONS: { value: CommunityPostTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "discussion", label: "Discussion" },
  { value: "question", label: "Question" },
  { value: "resource", label: "Resource" },
  { value: "article", label: "Article" },
];

export function CommunityScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeCommunityStyles);
  const router = useRouter();
  const [postType, setPostType] = useState<CommunityPostTypeFilter>("all");
  const { posts, loading, refreshing, refresh, toggleLike } =
    useCommunityFeed(postType);
  const { conversations } = useMessagesInbox();

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + (conversation.unreadCount ?? 0),
        0
      ),
    [conversations]
  );
  const inboxBadgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  function renderHeader() {
    return (
      <View>
        <LinearGradient colors={[colors.brandDeep, colors.brandPrimary]} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => router.push("/messages")}
                style={styles.inboxButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={
                  unreadCount > 0
                    ? `${unreadCount} unread conversations. Open messages inbox`
                    : "Open messages inbox"
                }
              >
                <Feather name="inbox" size={16} color="#ffffff" />
                <Text style={styles.inboxButtonText}>Inbox</Text>
                {unreadCount > 0 ? (
                  <View style={styles.inboxBadge}>
                    <Text style={styles.inboxBadgeText}>{inboxBadgeText}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/community/new")}
                style={styles.newPostButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Create new post"
              >
                <Feather name="plus" size={16} color={colors.brandDeep} />
                <Text style={styles.newPostButtonText}>New Post</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerTextWrap}>
              <CommunityGradientTitle
                text="Community"
                containerStyle={styles.headerTitleWrap}
                textStyle={styles.headerTitleGlyph}
              />
              <Text style={styles.headerSubtitle}>Discuss, ask questions, and share notes with fellow students.</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_OPTIONS.map((option) => {
            const active = option.value === postType;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setPostType(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Show ${option.label.toLowerCase()} posts`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  function renderEmpty() {
    if (loading) {
      return <BrandedSpinner />;
    }
    return (
      <View style={styles.emptyContainer}>
        <Feather name="message-circle" size={48} color={colors.brandPrimary} />
        <Text style={styles.emptyTitle}>
          {postType === "all" ? "No posts yet" : `No ${postType} posts yet`}
        </Text>
        <Text style={styles.emptySubtitle}>Be the first to publish a post from mobile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.brandPrimary}
          />
        }
        renderItem={({ item }) => (
          <PostCard 
            post={item} 
            styles={styles} 
            onLike={() => toggleLike(item.id)}
            onPress={() => router.push(`/community/${item.id}` as any)}
          />
        )}
      />
    </View>
  );
}
