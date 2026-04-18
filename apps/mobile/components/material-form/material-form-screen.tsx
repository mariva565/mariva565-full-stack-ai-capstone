import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

import { GRADIENTS } from "../../lib/colors";
import { styles } from "./material-form.styles";
import type { MaterialFormScreenProps, FocusedField } from "./material-form.types";
import { MaterialInputField } from "./material-form-input";
import { MaterialTypeSelector } from "./material-form-type-picker";

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
        <View style={styles.card}>
          <MaterialPrimaryFields
            values={props.values}
            focusedField={focusedField}
            onFocusChange={setFocusedField}
            onTitleChange={props.onTitleChange}
            onContentChange={props.onContentChange}
            autoFocusTitle={props.autoFocusTitle}
            titleAccessibilityHint={props.titleAccessibilityHint}
          />
          <MaterialMetadataFields
            values={props.values}
            tagsLabel={props.tagsLabel ?? "Tags"}
            showUrlField={props.showUrlField}
            focusedField={focusedField}
            onFocusChange={setFocusedField}
            onFileUrlChange={props.onFileUrlChange}
            onTagsChange={props.onTagsChange}
          />
        </View>
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
