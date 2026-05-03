"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarButton({
  active,
  onClick,
  label,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
        active
          ? "border-brand-400 bg-brand-100 text-brand-700 dark:border-brand-600 dark:bg-brand-900/40 dark:text-brand-300"
          : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-900/20"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" />;
}

// ─── Editor ──────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "180px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "tiptap-content outline-none px-4 py-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200",
          "prose prose-sm max-w-none",
          "prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white",
          "prose-strong:text-slate-900 dark:prose-strong:text-white",
          "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:text-slate-700 dark:prose-code:bg-slate-800 dark:prose-code:text-slate-300",
          "prose-ul:pl-4 prose-ol:pl-4",
        ].join(" "),
        "data-placeholder": placeholder,
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-brand-600">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
        <ToolbarButton
          label="B"
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="I"
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="• List"
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="1. List"
          title="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="<>"
          title="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Table"
          title="Insert Table"
          active={editor.isActive("table")}
          onClick={() =>
            editor.isActive("table")
              ? editor.chain().focus().deleteTable().run()
              : editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        />
        {editor.isActive("table") && (
          <>
            <ToolbarButton label="+Col" title="Add Column" onClick={() => editor.chain().focus().addColumnAfter().run()} />
            <ToolbarButton label="-Col" title="Remove Column" onClick={() => editor.chain().focus().deleteColumn().run()} />
            <ToolbarButton label="+Row" title="Add Row" onClick={() => editor.chain().focus().addRowAfter().run()} />
            <ToolbarButton label="-Row" title="Remove Row" onClick={() => editor.chain().focus().deleteRow().run()} />
          </>
        )}
      </div>

      {/* Editor area */}
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
