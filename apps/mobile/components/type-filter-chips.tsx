import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../lib/colors";
import { MATERIAL_TYPE_OPTIONS, type MaterialType } from "../lib/material-utils";

type Props = {
  selected: MaterialType | null;
  onSelect: (type: MaterialType | null) => void;
};

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
        accessibilityRole="button"
        accessibilityLabel="Show all material types"
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>
      {MATERIAL_TYPE_OPTIONS.map((type) => {
        const active = selected === type.key;
        return (
          <TouchableOpacity
            key={type.key}
            style={[styles.chip, active && { backgroundColor: type.bg, borderColor: type.color }]}
            onPress={() => onSelect(active ? null : type.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Filter materials by ${type.label}`}
          >
            <View style={[styles.dot, { backgroundColor: type.color }]} />
            <Text style={[styles.chipText, active && { color: type.color }]}>{type.label}</Text>
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: COLORS.brandPrimary,
    borderColor: COLORS.brandPrimary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.textOnBrand,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
