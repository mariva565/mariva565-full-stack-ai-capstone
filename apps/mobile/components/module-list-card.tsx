import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={onOpen} activeOpacity={0.78}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.copyWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {module.title}
          </Text>
          <Text style={styles.meta}>
            {module.description?.trim() || "Open the module workspace to manage materials."}
          </Text>
        </View>
        <Text style={styles.cta}>Open</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.hint}>Workspace for this module's materials</Text>
        <EntityActions compact onEdit={onEdit} onDelete={onDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#2e1d7a",
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
    backgroundColor: "#f0ecff",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: { fontSize: 14, fontWeight: "800", color: "#4d33c4" },
  copyWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  meta: { fontSize: 13, color: "#64748b", lineHeight: 19, marginTop: 4 },
  cta: { fontSize: 12, fontWeight: "700", color: "#4d33c4" },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#f1edff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  hint: { fontSize: 12, color: "#7c6ea8", marginBottom: 10 },
});
