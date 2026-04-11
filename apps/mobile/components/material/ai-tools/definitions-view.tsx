import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../lib/app-preferences";
import type { Definition } from "../../../lib/studyhub-types";

export function DefinitionsView({ definitions }: { definitions: Definition[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.header, { color: colors.brandPrimary }]}>
        DEFINITIONS - {definitions.length} terms
      </Text>
      <View style={styles.list}>
        {definitions.map((def, idx) => (
          <View key={`${idx}-${def.term}`} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderMuted }]}>
            <Text style={[styles.term, { color: colors.textPrimary }]}>{def.term}</Text>
            <Text style={[styles.defText, { color: colors.textSecondary }]}>{def.definition}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  header: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  term: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  defText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
