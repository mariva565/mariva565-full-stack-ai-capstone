import { TextInput, Text, View, type KeyboardTypeOptions } from "react-native";
import { COLORS } from "../../lib/colors";
import { styles } from "./material-form.styles";
import type { FocusedField } from "./material-form.types";

type InputFieldProps = {
  field: Exclude<FocusedField, null>;
  label: string;
  value: string;
  placeholder: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  focusedField: FocusedField;
  onFocusChange: (field: FocusedField) => void;
  onChangeText: (value: string) => void;
  autoFocus?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: "top" | "center" | "bottom";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
};

export function MaterialInputField({
  field,
  label,
  value,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
  focusedField,
  onFocusChange,
  onChangeText,
  autoFocus,
  multiline,
  numberOfLines,
  textAlignVertical,
  autoCapitalize,
  keyboardType,
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline ? styles.textArea : null,
          focusedField === field ? styles.inputFocused : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => onFocusChange(field)}
        onBlur={() => onFocusChange(null)}
        autoFocus={autoFocus}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={textAlignVertical}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
    </View>
  );
}
