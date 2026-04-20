import { View, Text, StyleSheet } from "react-native";
import { useThemedStyles } from "../lib/app-preferences";
import type { AppColors } from "../lib/colors";

type Props = {
  icon: string;
  title: string;
  subtitle?: string;
};

const EMPTY_STATE_ICONS: Record<string, string> = {
  Courses: "\u{1F4DA}",
  Modules: "\u{1F9E9}",
  Notes: "\u{1F4DD}",
  Search: "\u{1F50D}",
  Favorites: "\u2764\uFE0F",
  Heart: "\u2764\uFE0F",
  // Legacy mojibake fallback from older UTF-8/CP1251 mismatches.
  "вќ¤": "\u2764\uFE0F",
};

function resolveEmptyStateIcon(icon: string): string {
  return EMPTY_STATE_ICONS[icon] ?? icon;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const resolvedIcon = resolveEmptyStateIcon(icon);
  const styles = useThemedStyles(makeEmptyStateStyles);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{resolvedIcon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function makeEmptyStateStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      paddingVertical: 40,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.violetSoft,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    icon: {
      fontSize: 36,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textStrong,
      marginBottom: 4,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
}
