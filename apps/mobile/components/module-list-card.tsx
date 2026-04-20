import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BRAND_FONT_FAMILY } from "../lib/brand-font";
import { useThemedStyles } from "../lib/app-preferences";
import type { AppColors } from "../lib/colors";
import type { Module } from "../lib/studyhub-types";
import { EntityActions } from "./entity-actions";

type Props = {
  index: number;
  module: Module;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ModuleListCard({ index, module, onOpen, onEdit, onDelete }: Props) {
  const styles = useThemedStyles(makeModuleListCardStyles);
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={onOpen}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Open module ${module.title}`}
        accessibilityHint="Opens this module workspace"
      >
        <View style={styles.numberCircle}>
          <Text style={styles.numberText} maxFontSizeMultiplier={1.2}>
            {index + 1}
          </Text>
        </View>
        <View style={styles.copyWrap}>
          <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {module.title}
          </Text>
          <Text style={styles.meta} maxFontSizeMultiplier={1.3}>
            {module.description?.trim() || "Open the module workspace to manage materials."}
          </Text>
        </View>
        <Text style={styles.cta} maxFontSizeMultiplier={1.2}>
          Open
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.hint} maxFontSizeMultiplier={1.2}>
          Workspace for this module's materials
        </Text>
        <View style={styles.actionsWrap}>
          <EntityActions
            compact
            onEdit={onEdit}
            onDelete={onDelete}
            editLabel={`Edit module ${module.title}`}
            deleteLabel={`Delete module ${module.title}`}
          />
        </View>
      </View>
    </View>
  );
}

function makeModuleListCardStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: colors.brandDeep,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
    },
    numberCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.violetSoft,
      justifyContent: "center",
      alignItems: "center",
    },
    numberText: { fontSize: 14, fontWeight: "800", color: colors.brandPrimary },
    copyWrap: { flex: 1 },
    title: {
      fontSize: 16,
      lineHeight: 21,
      color: colors.textPrimary,
      fontFamily: BRAND_FONT_FAMILY,
    },
    meta: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 4 },
    cta: { fontSize: 12, fontWeight: "700", color: colors.brandPrimary },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 14,
    },
    hint: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
    actionsWrap: {
      alignItems: "flex-end",
    },
  });
}
