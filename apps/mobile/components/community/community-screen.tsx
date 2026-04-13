import React from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { makeCommunityStyles } from "./community.styles";
import { useCommunityFeed } from "./use-community-feed";
import { PostCard } from "./post-card";
import { BrandedSpinner } from "../branded-spinner";

export function CommunityScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeCommunityStyles);
  const router = useRouter();
  const { posts, loading, refreshing, refresh, toggleLike } = useCommunityFeed();

  function renderHeader() {
    return (
      <LinearGradient colors={[colors.brandDeep, colors.brandPrimary]} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Discuss, ask questions, and share notes with fellow students.</Text>
          </View>
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
