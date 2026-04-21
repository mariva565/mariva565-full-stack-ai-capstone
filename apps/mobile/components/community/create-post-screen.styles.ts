import { StyleSheet } from "react-native";

import type { AppColors } from "../../lib/colors";

export function makeCreatePostStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingTop: 56,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.titlePrimary,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.canvas,
    },
    content: {
      padding: 16,
      paddingBottom: 120,
      gap: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    typeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    typeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    typeChipActive: {
      borderColor: colors.brandPrimary,
      backgroundColor: colors.violetSoft,
    },
    typeChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    typeChipTextActive: {
      color: colors.brandPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    textarea: {
      minHeight: 180,
      textAlignVertical: "top",
      lineHeight: 22,
    },
    helperText: {
      marginTop: 6,
      fontSize: 12,
      color: colors.textMuted,
    },
    errorBox: {
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#fca5a5",
      backgroundColor: "#fef2f2",
    },
    errorText: {
      color: "#b91c1c",
      fontSize: 13,
      fontWeight: "600",
    },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 24,
      borderTopWidth: 1,
      borderTopColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    submitButton: {
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.brandPrimary,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.55,
    },
    submitText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "800",
    },
  });
}
