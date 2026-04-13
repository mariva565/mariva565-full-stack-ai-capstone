import { StyleSheet } from "react-native";
import type { AppColors } from "../../lib/colors";

export function makeMessagesStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.canvas,
    },
    listContent: {
      padding: 16,
      paddingBottom: 96,
      gap: 10,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.violetSoft,
    },
    avatarText: {
      color: colors.brandPrimary,
      fontSize: 14,
      fontWeight: "800",
    },
    rowContent: {
      flex: 1,
      minWidth: 0,
    },
    rowTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    rowName: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    rowTime: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: "600",
    },
    rowPreview: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    arrowHint: {
      color: colors.textMuted,
      fontSize: 20,
      lineHeight: 20,
      fontWeight: "500",
    },
    threadArea: {
      flex: 1,
    },
    threadContent: {
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
      paddingBottom: 24,
    },
    bubbleRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-end",
    },
    bubbleRowOwn: {
      justifyContent: "flex-end",
    },
    bubbleRowOther: {
      justifyContent: "flex-start",
    },
    bubble: {
      maxWidth: "80%",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderWidth: 1,
    },
    bubbleOwn: {
      backgroundColor: colors.brandPrimary,
      borderColor: colors.brandPrimary,
      borderTopRightRadius: 6,
    },
    bubbleOther: {
      backgroundColor: colors.surface,
      borderColor: colors.borderMuted,
      borderTopLeftRadius: 6,
    },
    bubbleTextOwn: {
      color: "#ffffff",
      fontSize: 14,
      lineHeight: 20,
    },
    bubbleTextOther: {
      color: colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    bubbleMeta: {
      marginTop: 4,
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: "600",
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.borderMuted,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
    },
    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 120,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.canvas,
      color: colors.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      lineHeight: 20,
      textAlignVertical: "top",
    },
    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandPrimary,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendIcon: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "800",
    },
  });
}
