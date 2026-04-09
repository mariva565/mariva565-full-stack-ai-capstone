import { StyleSheet, TextInput, TouchableOpacity, Text, View } from "react-native";
import { COLORS } from "../lib/colors";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = "Search..." }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icon}>&#x1F50D;</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search materials"
        accessibilityHint="Type text to filter the current materials list"
        maxFontSizeMultiplier={1.4}
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
          accessibilityHint="Clears the current search query"
        >
          <Text style={styles.clearText} maxFontSizeMultiplier={1.2}>
            Clear
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.borderMuted,
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    paddingVertical: 10,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.brandPrimary,
  },
});
