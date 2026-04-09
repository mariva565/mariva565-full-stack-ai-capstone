import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { COLORS } from "../lib/colors";

type RequestStateProps = {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  accessibilityLabel?: string;
};

const REQUEST_STATE_ICONS: Record<string, string> = {
  Offline: "\u{1F4F6}",
  Error: "\u26A0\uFE0F",
};

function resolveIcon(icon: string): string {
  return REQUEST_STATE_ICONS[icon] ?? icon;
}

export function RequestState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  accessibilityLabel,
}: RequestStateProps) {
  const resolvedIcon = resolveIcon(icon);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{resolvedIcon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? actionLabel}
        >
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: { fontSize: 34 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textStrong,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 18,
    backgroundColor: COLORS.brandPrimary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  actionBtnText: {
    color: COLORS.textOnBrand,
    fontWeight: "700",
  },
});
