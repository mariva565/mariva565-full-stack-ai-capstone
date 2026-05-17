import { useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { RequestState } from "../request-state";
import { BrandedSpinner } from "../branded-spinner";
import { QrScannerScreen } from "../profile-tab/qr-scanner-screen";
import { makeMessagesStyles } from "./messages.styles";
import { useMessagesInbox } from "./use-messages-inbox";
import type { ConversationListItem } from "./messages.types";
import { useState } from "react";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((token) => token[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTimeLabel(dateIso: string): string {
  const diff = Date.now() - new Date(dateIso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function MessagesInboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeMessagesStyles);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { conversations, loading, refreshing, error, refresh } =
    useMessagesInbox();

  const listHeader = useMemo(
    () => (
      <View>
        <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 56) }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbox</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => router.push("/community")}
            accessibilityRole="button"
            accessibilityLabel="Start new chat"
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.startChatRow}>
          <TouchableOpacity
            style={styles.startChatAction}
            onPress={() => setScannerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Scan QR code to start a chat"
          >
            <Ionicons name="qr-code-outline" size={22} color={colors.brandPrimary} />
            <Text style={styles.startChatActionText}>Scan QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startChatAction}
            onPress={() => router.push("/community")}
            accessibilityRole="button"
            accessibilityLabel="Open community to find someone to message"
          >
            <Ionicons name="people-outline" size={22} color={colors.brandPrimary} />
            <Text style={styles.startChatActionText}>Community</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [colors.brandPrimary, colors.textPrimary, insets.top, router, styles]
  );

  function openThread(conversationId: number) {
    router.push(`/messages/${conversationId}` as never);
  }

  function renderConversation({ item }: { item: ConversationListItem }) {
    const name = item.other?.name ?? "Unknown";
    const lastMessage = item.lastMessage?.content ?? "No messages yet";
    const timeLabel = item.lastMessage
      ? formatTimeLabel(item.lastMessage.createdAt)
      : "";

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => openThread(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text numberOfLines={1} style={styles.rowName}>
              {name}
            </Text>
            {timeLabel ? <Text style={styles.rowTime}>{timeLabel}</Text> : null}
          </View>
          <Text numberOfLines={1} style={styles.rowPreview}>
            {lastMessage}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        {listHeader}
        <BrandedSpinner message="Loading conversations..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {listHeader}
        <RequestState
          icon="Error"
          title="Could not load inbox"
          subtitle={error}
          actionLabel="Try again"
          onAction={refresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <RequestState
            icon="\u{1F4AC}"
            title="No conversations yet"
            subtitle="Use the buttons above to start a chat."
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + Math.max(insets.bottom, 12) },
        ]}
        renderItem={renderConversation}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.brandPrimary}
          />
        }
      />
      <QrScannerScreen visible={scannerOpen} onClose={() => setScannerOpen(false)} />
    </View>
  );
}

