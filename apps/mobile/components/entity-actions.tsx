import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../lib/colors";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
  editLabel?: string;
  deleteLabel?: string;
};

export function EntityActions({
  onEdit,
  onDelete,
  compact = false,
  editLabel = "Edit item",
  deleteLabel = "Delete item",
}: Props) {
  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      <TouchableOpacity
        style={[styles.button, styles.editButton, compact && styles.compactButton]}
        onPress={onEdit}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={editLabel}
      >
        <Text style={[styles.editText, compact && styles.compactText]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton, compact && styles.compactButton]}
        onPress={onDelete}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={deleteLabel}
      >
        <Text style={[styles.deleteText, compact && styles.compactText]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    alignSelf: "flex-end",
  },
  compactRow: {
    marginTop: 8,
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
    backgroundColor: COLORS.violetSoft,
    borderColor: COLORS.violetBorder,
  },
  deleteButton: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.dangerBorder,
  },
  editText: {
    color: COLORS.violetText,
    fontSize: 13,
    fontWeight: "700",
  },
  deleteText: {
    color: COLORS.dangerText,
    fontSize: 13,
    fontWeight: "700",
  },
  compactText: {
    fontSize: 12,
  },
});
