import { StyleSheet } from "react-native";

import { BRAND_FONT_FAMILY } from "../../lib/brand-font";
import type { AppColors } from "../../lib/colors";

export function makeCourseDetailsStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.canvas,
      paddingHorizontal: 32,
    },
    errorText: { fontSize: 16, color: colors.danger, marginBottom: 16, textAlign: "center" },
    retryBtn: {
      backgroundColor: colors.brandPrimary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryBtnText: { color: colors.textOnBrand, fontWeight: "600" },
    hero: { paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: "800",
      color: "rgba(255,255,255,0.65)",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 10,
    },
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
      marginBottom: 12,
    },
    heroMetaRow: { gap: 4 },
    heroMeta: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
    courseActionsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    courseActionBtn: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
    },
    courseEditBtn: {
      backgroundColor: "rgba(255,255,255,0.14)",
      borderColor: "rgba(255,255,255,0.35)",
    },
    courseDeleteBtn: {
      backgroundColor: "rgba(190,24,93,0.18)",
      borderColor: "rgba(253,164,175,0.4)",
    },
    courseActionText: { fontSize: 13, fontWeight: "700" },
    courseEditText: { color: colors.textOnBrand },
    courseDeleteText: { color: colors.textOnDangerSoft },
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
      maxWidth: 250,
    },
    addModuleBtn: {
      backgroundColor: colors.lavenderSoft,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    addModuleBtnText: { fontSize: 13, fontWeight: "700", color: colors.brandPrimary },
    bottomSpacer: { height: 32 },
  });
}
