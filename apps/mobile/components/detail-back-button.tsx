import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { useThemedStyles } from "../lib/app-preferences";
import type { AppColors } from "../lib/colors";

type DetailBackButtonProps = {
  label: string;
  onPress: () => void;
};

export function DetailBackButton({ label, onPress }: DetailBackButtonProps) {
  const styles = useThemedStyles(makeDetailBackButtonStyles);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.icon} aria-hidden>
        {"<-"}
      </Text>
      <Text style={styles.label} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function makeDetailBackButtonStyles(colors: AppColors) {
  return StyleSheet.create({
    button: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: 999,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    icon: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.brandPrimary,
    },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.brandPrimary,
    },
  });
}
