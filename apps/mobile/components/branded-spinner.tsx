import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

type Props = {
  message?: string;
};

export function BrandedSpinner({ message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <ActivityIndicator size="large" color="#4d33c4" />
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
    backgroundColor: "#f8f6ff",
    paddingHorizontal: 32,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
});
