import { MaterialFormScreen } from "../../../components/material-form/material-form-screen";
import { useAddMaterialScreen } from "../../../components/material-form/use-add-material-screen";

export default function AddMaterialScreen() {
  const {
    values,
    loading,
    error,
    showUrlField,
    setTitle,
    setContent,
    setMaterialType,
    setFileUrl,
    setTags,
    handleCreate,
    handleCancel,
  } = useAddMaterialScreen();

  return (
    <MaterialFormScreen
      screenTitle="New Material"
      heading="Add material"
      iconText="+"
      values={values}
      error={error}
      loading={loading}
      showUrlField={showUrlField}
      submitLabel="Add Material"
      loadingLabel="Adding..."
      titleAccessibilityHint="Optional title for this material"
      submitAccessibilityLabel="Add material"
      submitAccessibilityHint="Creates this material in the current module"
      cancelAccessibilityLabel="Cancel adding material"
      cancelAccessibilityHint="Discard changes and go back"
      tagsLabel="Tags (comma-separated)"
      autoFocusTitle
      onTitleChange={setTitle}
      onContentChange={setContent}
      onMaterialTypeChange={setMaterialType}
      onFileUrlChange={setFileUrl}
      onTagsChange={setTags}
      onSubmit={handleCreate}
      onCancel={handleCancel}
    />
  );
}
