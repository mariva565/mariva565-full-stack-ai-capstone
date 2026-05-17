import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { useThemedStyles } from "../lib/app-preferences";
import type { AppColors } from "../lib/colors";

type DetailBackButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function DetailBackButton({
  label,
  onPress,
  accessibilityLabel = label,
}: DetailBackButtonProps) {
  const styles = useThemedStyles(makeDetailBackButtonStyles);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
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
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.24)",
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.14)",
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    icon: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textOnBrand,
    },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textOnBrand,
    },
  });
}
