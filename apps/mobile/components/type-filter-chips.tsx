import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles, useTheme } from "../lib/app-preferences";
import type { AppColors } from "../lib/colors";
import { getMaterialTypeOptions, type MaterialType } from "../lib/material-utils";

type Props = {
  selected: MaterialType | null;
  onSelect: (type: MaterialType | null) => void;
};

export function TypeFilterChips({ selected, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeTypeFilterChipsStyles);
  const options = getMaterialTypeOptions(colors);
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
        accessibilityHint="Removes the current type filter"
        accessibilityState={{ selected: !selected }}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]} maxFontSizeMultiplier={1.2}>
          All
        </Text>
      </TouchableOpacity>
      {options.map((type) => {
        const active = selected === type.key;
        return (
          <TouchableOpacity
            key={type.key}
            style={[styles.chip, active && { backgroundColor: type.bg, borderColor: type.color }]}
            onPress={() => onSelect(active ? null : type.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Filter materials by ${type.label}`}
            accessibilityHint={active ? "Clears this filter" : `Shows only ${type.label} materials`}
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.dot, { backgroundColor: type.color }]} />
            <Text style={[styles.chipText, active && { color: type.color }]} maxFontSizeMultiplier={1.2}>
              {type.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function makeTypeFilterChipsStyles(colors: AppColors) {
  return StyleSheet.create({
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipActive: {
      backgroundColor: colors.brandPrimary,
      borderColor: colors.brandPrimary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.textOnBrand,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });
}
