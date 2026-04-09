import { StyleSheet } from "react-native";

import { BRAND_FONT_FAMILY } from "../../lib/brand-font";
import { COLORS } from "../../lib/colors";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
  },
  visualRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  mascot: {
    width: 96,
    height: 96,
  },
  brandTitle: {
    fontSize: 42,
    lineHeight: 58,
    marginBottom: 8,
    color: "#6366F1",
    fontFamily: BRAND_FONT_FAMILY,
    letterSpacing: -0.2,
    paddingBottom: 6,
  },
  brandTitleAccent: {
    color: "#8B5CF6",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 280,
  },
});
