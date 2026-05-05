"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import {
  countPostImages,
  MAX_POST_IMAGES,
  POST_IMAGE_FILE_ACCEPT,
  POST_IMAGE_MAX_BYTES,
  validatePostImageFile,
} from "@/lib/post-images";
import { RichTextToolbar } from "./rich-text-toolbar";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

type EditorInstance = NonNullable<ReturnType<typeof useEditor>>;
type UploadResponse = { url?: unknown; message?: unknown };

function getFiles(files: FileList | null | undefined): File[] {
  return Array.from(files ?? []);
}

function hasDraggedFile(dataTransfer: DataTransfer | null): boolean {
  const types = Array.from(dataTransfer?.types ?? []);
  const items = Array.from(dataTransfer?.items ?? []);
  return (
    types.includes("Files") ||
    items.some((item) => item.kind === "file") ||
    (dataTransfer?.files.length ?? 0) > 0
  );
}

function getMinHeightClass(minHeight: string): string {
  return minHeight === "200px" ? "min-h-[200px]" : "min-h-[180px]";
}

function getMaxImageMegabytes(): number {
  return POST_IMAGE_MAX_BYTES / (1024 * 1024);
}

function getPayloadMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return "";
  }

  return String((payload as UploadResponse).message ?? "");
}

async function uploadPostImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/post-image", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as UploadResponse | null;

  if (!response.ok) {
    throw new Error(getPayloadMessage(payload) || "Image upload failed.");
  }

  if (!payload || typeof payload.url !== "string") {
    throw new Error("Image upload did not return a URL.");
  }

  return payload.url;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "180px",
}: RichTextEditorProps) {
  const editorRef = useRef<EditorInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadingRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
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
      handlePaste: (_view, event) => handleImagePaste(event),
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  if (!editor) return null;

  async function uploadImageFiles(files: File[]) {
    const currentEditor = editorRef.current;
    if (!currentEditor || uploadingRef.current || files.length === 0) return;

    const validationMessage = files.map(validatePostImageFile).find(Boolean);
    if (validationMessage) {
      setImageError(validationMessage);
      return;
    }

    const imageCount = countPostImages(currentEditor.getHTML());
    if (imageCount + files.length > MAX_POST_IMAGES) {
      setImageError(`You can add up to ${MAX_POST_IMAGES} images per post.`);
      return;
    }

    await insertUploadedImages(currentEditor, files);
  }

  async function insertUploadedImages(currentEditor: EditorInstance, files: File[]) {
    uploadingRef.current = true;
    setIsUploading(true);
    setImageError("");
    currentEditor.setEditable(false);

    try {
      for (const file of files) {
        const url = await uploadPostImage(file);
        currentEditor.setEditable(true);
        currentEditor.chain().focus().setImage({ src: url, alt: file.name }).run();
        currentEditor.setEditable(false);
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
      currentEditor.setEditable(true);
    }
  }

  function handleEditorDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (!hasDraggedFile(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = isUploading ? "none" : "copy";
    setIsDraggingImage(true);
  }

  function handleEditorDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (!hasDraggedFile(event.dataTransfer)) return;
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    event.stopPropagation();
    setIsDraggingImage(false);
  }

  function handleEditorDrop(event: React.DragEvent<HTMLDivElement>) {
    if (!hasDraggedFile(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingImage(false);

    void uploadImageFiles(getFiles(event.dataTransfer.files));
  }

  function handleImagePaste(event: ClipboardEvent): boolean {
    const files = getFiles(event.clipboardData?.files);
    if (files.length === 0) return false;

    event.preventDefault();
    void uploadImageFiles(files);
    return true;
  }

  function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = getFiles(event.currentTarget.files);
    event.currentTarget.value = "";
    void uploadImageFiles(files);
  }

  return (
    <div
      aria-busy={isUploading}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-brand-600"
    >
      <RichTextToolbar
        editor={editor}
        isUploading={isUploading}
        onInsertImage={() => fileInputRef.current?.click()}
      />
      <p className="border-b border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
        Images: JPG, PNG, WebP, or GIF under {getMaxImageMegabytes()} MB. Use
        the Image button, drag and drop, or paste a screenshot. Max{" "}
        {MAX_POST_IMAGES} images per post.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept={POST_IMAGE_FILE_ACCEPT}
        multiple
        disabled={isUploading}
        onChange={handleFilePick}
        className="hidden"
      />
      <div
        onDragEnterCapture={handleEditorDragOver}
        onDragOverCapture={handleEditorDragOver}
        onDragLeaveCapture={handleEditorDragLeave}
        onDropCapture={handleEditorDrop}
        className={`relative ${getMinHeightClass(minHeight)} ${
          isDraggingImage ? "ring-2 ring-inset ring-brand-400" : ""
        }`}
      >
        <EditorContent editor={editor} />
        {isDraggingImage ? (
          <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl border-2 border-dashed border-brand-400 bg-brand-50/80 text-sm font-semibold text-brand-700 backdrop-blur-sm dark:border-brand-500 dark:bg-brand-950/70 dark:text-brand-200">
            Drop image to upload
          </div>
        ) : null}
      </div>
      {imageError ? (
        <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {imageError}
        </p>
      ) : null}
    </div>
  );
}
