import { Text, TouchableOpacity, View } from "react-native";
import { useTheme, useThemedStyles } from "../../lib/app-preferences";
import { getMaterialTypeOptions, type MaterialType } from "../../lib/material-utils";
import { makeMaterialFormStyles } from "./material-form.styles";

type Props = {
  materialType: MaterialType;
  onMaterialTypeChange: (value: MaterialType) => void;
};

export function MaterialTypeSelector({ materialType, onMaterialTypeChange }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeMaterialFormStyles);
  const options = getMaterialTypeOptions(colors);
  return (
    <View style={styles.typeRow}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.typeChip,
            materialType === option.key && {
              backgroundColor: option.bg,
              borderColor: option.color,
            },
          ]}
          onPress={() => onMaterialTypeChange(option.key)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Select material type ${option.label}`}
          accessibilityHint="Filters which optional fields are shown"
          accessibilityState={{ selected: materialType === option.key }}
        >
          <Text
            style={[
              styles.typeChipIcon,
              { color: materialType === option.key ? option.color : colors.textMuted },
            ]}
          >
            {option.icon}
          </Text>
          <Text
            style={[
              styles.typeChipLabel,
              materialType === option.key && { color: option.color, fontWeight: "700" },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
