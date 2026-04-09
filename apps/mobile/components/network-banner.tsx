import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "../lib/colors";

type NetworkBannerProps = {
  message: string;
};

export function NetworkBanner({ message }: NetworkBannerProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.label}>Offline mode</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warningSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.brandDeep,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  message: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
