import { StyleSheet } from "react-native";

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
    marginBottom: 12,
  },
  mascot: {
    width: 68,
    height: 68,
  },
  brandTitle: {
    fontSize: 42,
    lineHeight: 52,
    marginBottom: 8,
    color: "#6366F1",
    letterSpacing: -0.2,
    paddingBottom: 2,
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
