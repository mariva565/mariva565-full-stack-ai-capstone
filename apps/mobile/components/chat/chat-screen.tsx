import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useTheme } from "../../lib/app-preferences";
import { useChat } from "./use-chat";
import { MessageBubble } from "./message-bubble";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ChatScreen() {
  const { colors } = useTheme();
  const { messages, sendMessage, isTyping } = useChat();
  const [inputText, setInputText] = useState("");
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  function handleSend() {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  }

  function renderTypingIndicator() {
    if (!isTyping) return null;
    return (
      <View style={styles.typingBox}>
        <ActivityIndicator size="small" color={colors.brandPrimary} />
        <Text style={[styles.typingTxt, { color: colors.textSecondary }]}>Mentor is replying...</Text>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyBox}>
        <Image 
          source={require("../../assets/branding/AI-icon-3.png")} 
          style={{ width: 160, height: 160, marginBottom: 8, transform: [{ scale: 1.2 }] }} 
          resizeMode="contain"
        />
        <Text style={[styles.emptyTitle, { color: colors.titlePrimary }]}>StudyHub Mentor</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Ask me anything about your studies, code, or coursework!
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.canvas }]} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.borderMuted, paddingBottom: insets.bottom || 16 }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.canvas, color: colors.textPrimary }]}
          placeholder="Ask a question..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: colors.brandPrimary }, !inputText.trim() && { opacity: 0.5 }]} 
          disabled={!inputText.trim() || isTyping}
          onPress={handleSend}
        >
          <Text style={styles.sendBtnTxt}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  typingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  typingTxt: {
    fontSize: 13,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
