import { StyleSheet } from "react-native";

import { BRAND_FONT_FAMILY } from "../../lib/brand-font";
import type { AppColors } from "../../lib/colors";

export function makeFavoritesStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas },
    hero: {
      paddingTop: 56,
      paddingBottom: 16,
      paddingHorizontal: 20,
      gap: 6,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    heroTitle: {
      fontSize: 30,
      lineHeight: 36,
      fontFamily: BRAND_FONT_FAMILY,
      color: colors.textOnBrand,
      includeFontPadding: false,
    },
    heroPinnedBadge: {
      marginTop: 6,
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.16)",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
    },
    heroPinnedText: {
      fontSize: 12,
      color: "rgba(255,255,255,0.9)",
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    offlineBannerWrap: {
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
    },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 },
    errorText: { color: colors.danger, fontSize: 15, textAlign: "center", marginBottom: 16 },
    retryBtn: {
      backgroundColor: colors.brandPrimary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    retryText: {
      color: colors.textOnBrand,
      fontWeight: "700",
    },
    list: { padding: 16, paddingBottom: 28 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: 14,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    cardMain: { gap: 6 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
    cardMeta: { fontSize: 13, color: colors.textSecondary },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
    tag: {
      borderRadius: 6,
      backgroundColor: colors.violetSoft,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    tagText: { fontSize: 11, color: colors.violetText, fontWeight: "600" },
    cardActions: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    linkBtn: {
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.violetBorder,
      backgroundColor: colors.violetSoft,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    linkBtnText: { color: colors.violetText, fontWeight: "700", fontSize: 12 },
    unpinBtn: {
      marginLeft: "auto",
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    unpinBtnDisabled: {
      opacity: 0.7,
    },
    unpinBtnText: { color: colors.dangerText, fontSize: 12, fontWeight: "700" },
  });
}

export type FavoritesStyles = ReturnType<typeof makeFavoritesStyles>;
