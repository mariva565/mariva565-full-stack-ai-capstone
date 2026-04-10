import { StyleSheet } from "react-native";

import type { AppColors } from "../../lib/colors";

export function makeSettingsStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 32,
      gap: 16,
    },
    hero: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.violetBorder,
      backgroundColor: colors.violetSoft,
      padding: 16,
      gap: 6,
    },
    heroOverline: {
      fontSize: 12,
      color: colors.violetText,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    heroTitle: {
      fontSize: 23,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    heroMeta: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.textStrong,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginLeft: 2,
    },
    card: {
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 7,
      elevation: 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    rowTextWrap: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    rowMeta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    segmentedControl: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 3,
      backgroundColor: colors.violetSoft,
      borderWidth: 1,
      borderColor: colors.violetBorder,
      gap: 4,
    },
    segmentButton: {
      flex: 1,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: "center",
    },
    segmentButtonActive: {
      backgroundColor: colors.brandPrimary,
    },
    segmentLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.violetText,
    },
    segmentLabelActive: {
      color: colors.textOnBrand,
    },
    linkButton: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.violetBorder,
      backgroundColor: colors.violetSoft,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    linkButtonTitle: {
      color: colors.violetText,
      fontSize: 14,
      fontWeight: "700",
    },
    linkButtonMeta: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 12,
    },
    accountButton: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    accountButtonText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    logoutButton: {
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
    },
    logoutButtonText: {
      color: colors.dangerText,
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}
