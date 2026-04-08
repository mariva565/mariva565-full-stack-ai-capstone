import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { COLORS } from "../lib/colors";

type Props = {
  message?: string;
};

export function BrandedSpinner({ message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <ActivityIndicator size="large" color={COLORS.brandPrimary} />
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.canvas,
    paddingHorizontal: 32,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
