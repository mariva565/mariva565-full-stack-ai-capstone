"use client";

import { useId, useRef, useState } from "react";

const ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MATERIAL_MAX_BYTES = 3 * 1024 * 1024;
const MATERIAL_MAX_MB = MATERIAL_MAX_BYTES / (1024 * 1024);
const ACCEPT_ATTRIBUTE = ACCEPT.join(",");

type FileUploadButtonProps = {
  currentUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
};

function getFileName(currentUrl: string | null): string | null {
  if (!currentUrl) return null;

  const rawName = currentUrl.split("/").pop() ?? "";
  return decodeURIComponent(rawName).replace(/^\d+-[a-f0-9-]+\./, "");
}

function validateMaterialFile(file: File): string | null {
  if (!ACCEPT.includes(file.type as (typeof ACCEPT)[number])) {
    return "Only images, PDF, and Word documents are allowed.";
  }

  if (file.size > MATERIAL_MAX_BYTES) {
    return `Material files must be ${MATERIAL_MAX_MB} MB or smaller.`;
  }

  return null;
}

export function FileUploadButton({
  currentUrl,
  onUploadSuccess,
  onRemove,
}: FileUploadButtonProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileName = getFileName(currentUrl);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const validationMessage = validateMaterialFile(file);
    if (validationMessage) {
      setError(validationMessage);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Upload failed. Try again.");
      }

      const { url } = await response.json();
      onUploadSuccess(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {fileName ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
          <span className="min-w-0 flex-1 truncate text-sm text-emerald-700 dark:text-emerald-400">
            Attached: {fileName}
          </span>
          <label
            htmlFor={inputId}
            aria-disabled={uploading}
            className="shrink-0 cursor-pointer text-xs font-semibold text-emerald-600 hover:text-emerald-800 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-emerald-400 dark:hover:text-emerald-200"
          >
            Replace
          </label>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50 dark:text-rose-400 dark:hover:text-rose-200"
            >
              Remove file
            </button>
          ) : null}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          aria-disabled={uploading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400 dark:hover:border-brand-400 dark:hover:text-brand-400"
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
              Uploading...
            </>
          ) : (
            "Choose file (image, PDF, Word)"
          )}
        </label>
      )}

      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
