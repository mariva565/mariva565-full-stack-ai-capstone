import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BRAND_FONT_FAMILY } from "../lib/brand-font";
import { COLORS } from "../lib/colors";
import { getMaterialTypeConfig, splitTags } from "../lib/material-utils";
import type { Material } from "../lib/studyhub-types";
import { EntityActions } from "./entity-actions";

type Props = {
  material: Material;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function MaterialCard({ material, onOpen, onEdit, onDelete }: Props) {
  const config = getMaterialTypeConfig(material.materialType);
  const tags = splitTags(material.tags);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.main}
        onPress={onOpen}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Open material ${material.title}`}
        accessibilityHint="Opens full material details"
      >
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
            <Text style={[styles.iconText, { color: config.color }]} maxFontSizeMultiplier={1.2}>
              {config.icon}
            </Text>
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {material.title}
            </Text>
            {material.content ? (
              <Text style={styles.content} numberOfLines={3} maxFontSizeMultiplier={1.3}>
                {material.content}
              </Text>
            ) : (
              <Text style={styles.meta} maxFontSizeMultiplier={1.2}>
                {config.label} material
              </Text>
            )}
          </View>
        </View>

        {tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} maxFontSizeMultiplier={1.2}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={styles.footer}>
        <EntityActions
          compact
          onEdit={onEdit}
          onDelete={onDelete}
          editLabel={`Edit material ${material.title}`}
          deleteLabel={`Delete material ${material.title}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  main: { gap: 10 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: { fontSize: 13, fontWeight: "800" },
  copyWrap: { flex: 1 },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.brandDeep,
    fontFamily: BRAND_FONT_FAMILY,
  },
  content: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginTop: 6 },
  meta: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginLeft: 42 },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    alignItems: "flex-end",
  },
  tag: {
    backgroundColor: COLORS.violetSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: COLORS.brandPrimary, fontWeight: "600" },
});
