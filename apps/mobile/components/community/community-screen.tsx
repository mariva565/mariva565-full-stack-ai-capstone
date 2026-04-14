import React, { useMemo } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { makeCommunityStyles } from "./community.styles";
import { useCommunityFeed } from "./use-community-feed";
import { PostCard } from "./post-card";
import { BrandedSpinner } from "../branded-spinner";
import { useMessagesInbox } from "../messages/use-messages-inbox";
import { CommunityGradientTitle } from "./community-gradient-title";

export function CommunityScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeCommunityStyles);
  const router = useRouter();
  const { posts, loading, refreshing, refresh, toggleLike } = useCommunityFeed();
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
    );
  }

  function renderEmpty() {
    if (loading) {
      return <BrandedSpinner />;
    }
    return (
      <View style={styles.emptyContainer}>
        <Feather name="message-circle" size={48} color={colors.brandPrimary} />
        <Text style={styles.emptyTitle}>No posts yet</Text>
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
