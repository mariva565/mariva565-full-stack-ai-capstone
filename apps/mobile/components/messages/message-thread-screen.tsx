import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { useAuth } from "../../lib/auth-context";
import { useToast } from "../../lib/toast-context";
import { BrandedSpinner } from "../branded-spinner";
import { RequestState } from "../request-state";
import { makeMessagesStyles } from "./messages.styles";
import { useMessageThread } from "./use-message-thread";
import type { ConversationMessage } from "./messages.types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(dateIso: string): string {
  return new Date(dateIso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({
  message,
  ownMessage,
  styles,
}: {
  message: ConversationMessage;
  ownMessage: boolean;
  styles: ReturnType<typeof makeMessagesStyles>;
}) {
  return (
    <View
      style={[
        styles.bubbleRow,
        ownMessage ? styles.bubbleRowOwn : styles.bubbleRowOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          ownMessage ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text style={ownMessage ? styles.bubbleTextOwn : styles.bubbleTextOther}>
          {message.content}
        </Text>
        <Text style={styles.bubbleMeta}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
}

export function MessageThreadScreen({ conversationId }: { conversationId: number }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeMessagesStyles);
  const { user } = useAuth();
  const { showToast } = useToast();
  const scrollRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const {
    messages,
    otherUser,
    loading,
    refreshing,
    error,
    isSending,
    sendMessage,
    refresh,
  } = useMessageThread(conversationId);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  async function handleSend() {
    const errorMessage = await sendMessage(input);
    if (errorMessage) {
      showToast(errorMessage, "error");
      return;
    }
    setInput("");
  }

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return (
      <View style={styles.container}>
        <RequestState
          icon="Error"
          title="Invalid conversation"
          subtitle="Please open a conversation from inbox."
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <BrandedSpinner message="Loading conversation..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <RequestState
          icon="Error"
          title="Could not load conversation"
          subtitle={error}
          actionLabel="Try again"
          onAction={refresh}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 56) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(otherUser?.name ?? "Unknown")}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {otherUser?.name ?? "Conversation"}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.threadArea}
        contentContainerStyle={styles.threadContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.brandPrimary}
          />
        }
      >
        {messages.length === 0 ? (
          <RequestState
            icon="\u{1F4AC}"
            title="No messages yet"
            subtitle="Say hello to start the conversation."
          />
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              ownMessage={message.senderId === user?.id}
              styles={styles}
            />
          ))
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!input.trim() || isSending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="send" size={16} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

