import type { MaterialType } from "../../lib/material-utils";

export type MaterialFormValues = {
  title: string;
  content: string;
  materialType: MaterialType;
  fileUrl: string;
  tags: string;
};

export type MaterialFormScreenProps = {
  screenTitle: string;
  heading: string;
  iconText: string;
  values: MaterialFormValues;
  error: string;
  loading: boolean;
  showUrlField: boolean;
  submitLabel: string;
  loadingLabel: string;
  titleAccessibilityHint: string;
  submitAccessibilityLabel: string;
  submitAccessibilityHint: string;
  cancelAccessibilityLabel: string;
  cancelAccessibilityHint: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onMaterialTypeChange: (value: MaterialType) => void;
  onFileUrlChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  autoFocusTitle?: boolean;
  tagsLabel?: string;
};
