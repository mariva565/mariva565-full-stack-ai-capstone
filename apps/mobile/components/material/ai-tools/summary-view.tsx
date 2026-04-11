import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/app-preferences";

export function SummaryView({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderMuted }]}>
      <Text style={[styles.title, { color: colors.brandPrimary }]}>SUMMARY</Text>
      <Text style={[styles.text, { color: colors.textPrimary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    marginTop: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
});
