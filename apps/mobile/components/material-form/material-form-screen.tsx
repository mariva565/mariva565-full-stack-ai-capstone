import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { COLORS, GRADIENTS } from "../../lib/colors";
import { MATERIAL_TYPE_OPTIONS, type MaterialType } from "../../lib/material-utils";
import { styles } from "./material-form.styles";
import type { MaterialFormScreenProps } from "./material-form.types";

type FocusedField = "title" | "content" | "url" | "tags" | null;

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

function MaterialHeader({ iconText, heading }: { iconText: string; heading: string }) {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{iconText}</Text>
      </View>
      <Text style={styles.heading}>{heading}</Text>
    </View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBox} accessible accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

function MaterialTypeSelector({
  materialType,
  onMaterialTypeChange,
}: {
  materialType: MaterialType;
  onMaterialTypeChange: (value: MaterialType) => void;
}) {
  return (
    <View style={styles.typeRow}>
      {MATERIAL_TYPE_OPTIONS.map((option) => (
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
              { color: materialType === option.key ? option.color : COLORS.textMuted },
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

function MaterialInputField({
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

function MaterialFormCard({
  values,
  tagsLabel,
  showUrlField,
  autoFocusTitle,
  focusedField,
  onFocusChange,
  onTitleChange,
  onContentChange,
  onFileUrlChange,
  onTagsChange,
  titleAccessibilityHint,
}: {
  values: MaterialFormScreenProps["values"];
  tagsLabel: string;
  showUrlField: boolean;
  autoFocusTitle?: boolean;
  focusedField: FocusedField;
  onFocusChange: (field: FocusedField) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onFileUrlChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  titleAccessibilityHint: string;
}) {
  return (
    <View style={styles.card}>
      <MaterialPrimaryFields
        values={values}
        focusedField={focusedField}
        onFocusChange={onFocusChange}
        onTitleChange={onTitleChange}
        onContentChange={onContentChange}
        autoFocusTitle={autoFocusTitle}
        titleAccessibilityHint={titleAccessibilityHint}
      />
      <MaterialMetadataFields
        values={values}
        tagsLabel={tagsLabel}
        showUrlField={showUrlField}
        focusedField={focusedField}
        onFocusChange={onFocusChange}
        onFileUrlChange={onFileUrlChange}
        onTagsChange={onTagsChange}
      />
    </View>
  );
}

function MaterialPrimaryFields({
  values,
  focusedField,
  onFocusChange,
  onTitleChange,
  onContentChange,
  autoFocusTitle,
  titleAccessibilityHint,
}: {
  values: MaterialFormScreenProps["values"];
  focusedField: FocusedField;
  onFocusChange: (field: FocusedField) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  autoFocusTitle?: boolean;
  titleAccessibilityHint: string;
}) {
  return (
    <>
      <MaterialInputField
        field="title"
        label="Title"
        value={values.title}
        placeholder="Material title"
        focusedField={focusedField}
        onFocusChange={onFocusChange}
        onChangeText={onTitleChange}
        autoFocus={autoFocusTitle}
        accessibilityLabel="Material title"
        accessibilityHint={titleAccessibilityHint}
      />

      <MaterialInputField
        field="content"
        label="Content"
        value={values.content}
        placeholder="Write your notes here..."
        focusedField={focusedField}
        onFocusChange={onFocusChange}
        onChangeText={onContentChange}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
        accessibilityLabel="Material content"
        accessibilityHint="Write notes or summary for this material"
      />
    </>
  );
}

function MaterialMetadataFields({
  values,
  tagsLabel,
  showUrlField,
  focusedField,
  onFocusChange,
  onFileUrlChange,
  onTagsChange,
}: {
  values: MaterialFormScreenProps["values"];
  tagsLabel: string;
  showUrlField: boolean;
  focusedField: FocusedField;
  onFocusChange: (field: FocusedField) => void;
  onFileUrlChange: (value: string) => void;
  onTagsChange: (value: string) => void;
}) {
  return (
    <>
      {showUrlField ? (
        <MaterialInputField
          field="url"
          label="URL"
          value={values.fileUrl}
          placeholder="https://..."
          focusedField={focusedField}
          onFocusChange={onFocusChange}
          onChangeText={onFileUrlChange}
          autoCapitalize="none"
          keyboardType="url"
          accessibilityLabel="Material URL"
          accessibilityHint="Optional link for link or video material types"
        />
      ) : null}

      <MaterialInputField
        field="tags"
        label={tagsLabel}
        value={values.tags}
        placeholder="e.g. javascript, basics, intro"
        focusedField={focusedField}
        onFocusChange={onFocusChange}
        onChangeText={onTagsChange}
        autoCapitalize="none"
        accessibilityLabel="Material tags"
        accessibilityHint="Optional comma-separated tags"
      />
    </>
  );
}

function MaterialFormActions({
  loading,
  submitLabel,
  loadingLabel,
  submitAccessibilityLabel,
  submitAccessibilityHint,
  cancelAccessibilityLabel,
  cancelAccessibilityHint,
  onSubmit,
  onCancel,
}: {
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  submitAccessibilityLabel: string;
  submitAccessibilityHint: string;
  cancelAccessibilityLabel: string;
  cancelAccessibilityHint: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.disabledBtn]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={submitAccessibilityLabel}
        accessibilityHint={submitAccessibilityHint}
      >
        <LinearGradient colors={GRADIENTS.primaryAction} style={styles.submitGradient}>
          <Text style={styles.submitBtnText}>{loading ? loadingLabel : submitLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelAccessibilityLabel}
        accessibilityHint={cancelAccessibilityHint}
      >
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

export function MaterialFormScreen(props: MaterialFormScreenProps) {
  const [focusedField, setFocusedField] = useState<FocusedField>(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: props.screenTitle }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <MaterialHeader iconText={props.iconText} heading={props.heading} />
        {props.error ? <ErrorBanner message={props.error} /> : null}
        <MaterialTypeSelector
          materialType={props.values.materialType}
          onMaterialTypeChange={props.onMaterialTypeChange}
        />
        <MaterialFormCard
          values={props.values}
          tagsLabel={props.tagsLabel ?? "Tags"}
          showUrlField={props.showUrlField}
          autoFocusTitle={props.autoFocusTitle}
          focusedField={focusedField}
          onFocusChange={setFocusedField}
          onTitleChange={props.onTitleChange}
          onContentChange={props.onContentChange}
          onFileUrlChange={props.onFileUrlChange}
          onTagsChange={props.onTagsChange}
          titleAccessibilityHint={props.titleAccessibilityHint}
        />
        <MaterialFormActions
          loading={props.loading}
          submitLabel={props.submitLabel}
          loadingLabel={props.loadingLabel}
          submitAccessibilityLabel={props.submitAccessibilityLabel}
          submitAccessibilityHint={props.submitAccessibilityHint}
          cancelAccessibilityLabel={props.cancelAccessibilityLabel}
          cancelAccessibilityHint={props.cancelAccessibilityHint}
          onSubmit={props.onSubmit}
          onCancel={props.onCancel}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
