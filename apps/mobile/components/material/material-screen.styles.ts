import { StyleSheet } from "react-native";

import { BRAND_FONT_FAMILY } from "../../lib/brand-font";
import { COLORS } from "../../lib/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: COLORS.brandPrimary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.textOnBrand,
    fontWeight: "600",
  },
  hero: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 29,
    color: COLORS.textOnBrand,
    marginBottom: 6,
    fontFamily: BRAND_FONT_FAMILY,
  },
  heroDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  pinBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pinBtnNeutral: {
    borderColor: "rgba(255,255,255,0.34)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  pinBtnDanger: {
    borderColor: "rgba(253,164,175,0.45)",
    backgroundColor: "rgba(190,24,93,0.2)",
  },
  pinBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textOnBrand,
  },
  offlineBannerWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 14,
    padding: 20,
    shadowColor: COLORS.brandDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contentText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  noContent: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingVertical: 12,
  },
  linkCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.link,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.link,
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tagsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
  tagsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textTertiary,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.violetSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.brandPrimary,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 32,
  },
});
