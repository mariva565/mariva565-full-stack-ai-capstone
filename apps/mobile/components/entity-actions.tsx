import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
};

export function EntityActions({ onEdit, onDelete, compact = false }: Props) {
  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      <TouchableOpacity
        style={[styles.button, styles.editButton, compact && styles.compactButton]}
        onPress={onEdit}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.editText, compact && styles.compactText]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton, compact && styles.compactButton]}
        onPress={onDelete}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.deleteText, compact && styles.compactText]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  compactRow: {
    marginTop: 0,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  compactButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editButton: {
    backgroundColor: "#f5f3ff",
    borderColor: "#c4b5fd",
  },
  deleteButton: {
    backgroundColor: "#fff1f2",
    borderColor: "#fda4af",
  },
  editText: {
    color: "#5b21b6",
    fontSize: 13,
    fontWeight: "700",
  },
  deleteText: {
    color: "#be123c",
    fontSize: 13,
    fontWeight: "700",
  },
  compactText: {
    fontSize: 12,
  },
});
