import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <TouchableOpacity style={styles.main} onPress={onOpen} activeOpacity={0.78}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
            <Text style={[styles.iconText, { color: config.color }]}>{config.icon}</Text>
          </View>
          <View style={styles.copyWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {material.title}
            </Text>
            {material.content ? (
              <Text style={styles.content} numberOfLines={3}>
                {material.content}
              </Text>
            ) : (
              <Text style={styles.meta}>{config.label} material</Text>
            )}
          </View>
        </View>

        {tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </TouchableOpacity>

      <EntityActions compact onEdit={onEdit} onDelete={onDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f1edff",
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
  title: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  content: { fontSize: 13, color: "#64748b", lineHeight: 19, marginTop: 6 },
  meta: { fontSize: 13, color: "#94a3b8", marginTop: 6 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginLeft: 42 },
  tag: {
    backgroundColor: "#f0ecff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: "#4d33c4", fontWeight: "600" },
});
