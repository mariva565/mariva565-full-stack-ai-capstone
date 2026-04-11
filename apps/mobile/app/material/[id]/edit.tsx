import { BrandedSpinner } from "../../../components/branded-spinner";
import { MaterialFormScreen } from "../../../components/material-form/material-form-screen";
import { useEditMaterialScreen } from "../../../components/material-form/use-edit-material-screen";
import { Stack } from "expo-router";

export default function EditMaterialScreen() {
  const {
    values,
    loading,
    saving,
    error,
    showUrlField,
    setTitle,
    setContent,
    setMaterialType,
    setFileUrl,
    setTags,
    handleSave,
    handleCancel,
  } = useEditMaterialScreen();

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Material" }} />
        <BrandedSpinner message="Loading material..." />
      </>
    );
  }

  return (
    <MaterialFormScreen
      screenTitle="Edit Material"
      heading="Edit material"
      iconText="E"
      values={values}
      error={error}
      loading={saving}
      showUrlField={showUrlField}
      submitLabel="Save Changes"
      loadingLabel="Saving..."
      titleAccessibilityHint="Optional title for this material"
      submitAccessibilityLabel="Save material changes"
      submitAccessibilityHint="Updates this material and returns to the previous screen"
      cancelAccessibilityLabel="Cancel material editing"
      cancelAccessibilityHint="Discard unsaved changes and go back"
      onTitleChange={setTitle}
      onContentChange={setContent}
      onMaterialTypeChange={setMaterialType}
      onFileUrlChange={setFileUrl}
      onTagsChange={setTags}
      onSubmit={handleSave}
      onCancel={handleCancel}
    />
  );
}
