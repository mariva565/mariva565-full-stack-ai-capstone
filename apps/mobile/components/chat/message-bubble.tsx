import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../../lib/app-preferences";
import type { ChatMessage } from "../../lib/studyhub-types";
import { useToast } from "../../lib/toast-context";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const isUser = message.role === "user";

  async function handleCopy() {
    await Clipboard.setStringAsync(message.parts);
    showToast("Copied to clipboard", "success");
  }

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerModel]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.brandPrimary, borderBottomRightRadius: 4 }
            : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderMuted, borderBottomLeftRadius: 4 },
        ]}
      >
        <Text style={[styles.text, { color: isUser ? colors.textOnBrand : colors.textPrimary }]}>
          {message.parts}
        </Text>
        
        {!isUser ? (
          <TouchableOpacity 
            style={styles.copyBtn} 
            activeOpacity={0.6} 
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel="Copy AI response"
          >
            <Text style={[styles.copyBtnTxt, { color: colors.link }]}>Copy</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 16,
  },
  containerUser: {
    justifyContent: "flex-end",
  },
  containerModel: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  copyBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    padding: 4,
  },
  copyBtnTxt: {
    fontSize: 12,
    fontWeight: "700",
  },
});
