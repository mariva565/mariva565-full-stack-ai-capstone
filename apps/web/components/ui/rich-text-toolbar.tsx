"use client";

import type { Editor } from "@tiptap/react";

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  title?: string;
};

type RichTextToolbarProps = {
  editor: Editor;
  isUploading: boolean;
  onInsertImage: () => void;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      disabled={disabled}
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-brand-400 bg-brand-100 text-brand-700 dark:border-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
      }`}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" />;
}

function TableControls({
  editor,
  isUploading,
}: {
  editor: Editor;
  isUploading: boolean;
}) {
  if (!editor.isActive("table")) return null;

  return (
    <>
      <ToolbarButton
        label="+Col"
        title="Add Column"
        disabled={isUploading}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      />
      <ToolbarButton
        label="-Col"
        title="Remove Column"
        disabled={isUploading}
        onClick={() => editor.chain().focus().deleteColumn().run()}
      />
      <ToolbarButton
        label="+Row"
        title="Add Row"
        disabled={isUploading}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      />
      <ToolbarButton
        label="-Row"
        title="Remove Row"
        disabled={isUploading}
        onClick={() => editor.chain().focus().deleteRow().run()}
      />
    </>
  );
}

export function RichTextToolbar({
  editor,
  isUploading,
  onInsertImage,
}: RichTextToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
      <ToolbarButton
        label="B"
        title="Bold"
        active={editor.isActive("bold")}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="I"
        title="Italic"
        active={editor.isActive("italic")}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="H2"
        active={editor.isActive("heading", { level: 2 })}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="H3"
        active={editor.isActive("heading", { level: 3 })}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="Bullet"
        title="Bullet List"
        active={editor.isActive("bulletList")}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="1. List"
        title="Ordered List"
        active={editor.isActive("orderedList")}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="<>"
        title="Code Block"
        active={editor.isActive("codeBlock")}
        disabled={isUploading}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="Image"
        title="Insert image, or drag and paste images"
        disabled={isUploading}
        onClick={onInsertImage}
      />
      <ToolbarDivider />
      <ToolbarButton
        label="Table"
        title="Insert Table"
        active={editor.isActive("table")}
        disabled={isUploading}
        onClick={() =>
          editor.isActive("table")
            ? editor.chain().focus().deleteTable().run()
            : editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      />
      <TableControls editor={editor} isUploading={isUploading} />
      {isUploading ? (
        <span className="ml-1 text-xs font-medium text-brand-600 dark:text-brand-300">
          Uploading image...
        </span>
      ) : null}
    </div>
  );
}
