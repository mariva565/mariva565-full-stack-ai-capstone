import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MATERIAL_TYPE_CONFIG } from "../lib/material-utils";

type Props = {
  selected: string | null;
  onSelect: (type: string | null) => void;
};

const TYPES = Object.entries(MATERIAL_TYPE_CONFIG);

export function TypeFilterChips({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}
        activeOpacity={0.8}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>
      {TYPES.map(([key, config]) => {
        const active = selected === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.chip, active && { backgroundColor: config.bg, borderColor: config.color }]}
            onPress={() => onSelect(active ? null : key)}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: config.color }]} />
            <Text style={[styles.chipText, active && { color: config.color }]}>{config.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 10,
    maxHeight: 44,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: "#4d33c4",
    borderColor: "#4d33c4",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  chipTextActive: {
    color: "#ffffff",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
