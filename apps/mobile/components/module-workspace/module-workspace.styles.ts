import { StyleSheet } from "react-native";

import { BRAND_FONT_FAMILY } from "../../lib/brand-font";
import type { AppColors } from "../../lib/colors";

export function makeModuleWorkspaceStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.canvas,
      paddingHorizontal: 32,
    },
    errorText: {
      fontSize: 16,
      color: colors.danger,
      marginBottom: 16,
      textAlign: "center",
    },
    retryBtn: {
      backgroundColor: colors.brandPrimary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryBtnText: { color: colors.textOnBrand, fontWeight: "600" },
    hero: { paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
    coursePill: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.14)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginBottom: 14,
    },
    coursePillText: { fontSize: 12, fontWeight: "700", color: colors.textOnBrand },
    heroTitle: {
      fontSize: 24,
      lineHeight: 30,
      color: colors.textOnBrand,
      marginBottom: 10,
      fontFamily: BRAND_FONT_FAMILY,
    },
    heroDesc: {
      fontSize: 15,
      color: "rgba(255,255,255,0.84)",
      lineHeight: 22,
      marginBottom: 10,
    },
    heroMeta: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
    heroActions: { flexDirection: "row", gap: 10, marginTop: 18 },
    heroBtn: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
    },
    heroGhostBtn: {
      backgroundColor: "rgba(255,255,255,0.14)",
      borderColor: "rgba(255,255,255,0.35)",
    },
    heroDangerBtn: {
      backgroundColor: "rgba(190,24,93,0.18)",
      borderColor: "rgba(253,164,175,0.4)",
    },
    heroGhostBtnText: { fontSize: 13, fontWeight: "700", color: colors.textOnBrand },
    heroDangerBtnText: { fontSize: 13, fontWeight: "700", color: colors.textOnDangerSoft },
    offlineBannerWrap: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: -4,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      lineHeight: 24,
      color: colors.titlePrimary,
      fontFamily: BRAND_FONT_FAMILY,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 19,
      marginTop: 4,
      maxWidth: 240,
    },
    addBtn: {
      backgroundColor: colors.lavenderSoft,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    addBtnText: { fontSize: 13, fontWeight: "700", color: colors.brandPrimary },
    materialsList: { paddingHorizontal: 16 },
    bottomSpacer: { height: 32 },
  });
}
