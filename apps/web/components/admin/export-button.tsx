"use client";

import { useState } from "react";

type ExportButtonProps = {
  data: Record<string, unknown>[];
  headers: string[];
  keys: string[];
  filename: string;
};

function formatCsvValue(val: unknown): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(val: unknown): string {
  if (!val) return "";
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

export function ExportButton({ data, headers, keys, filename }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);

    const headerRow = headers.map(formatCsvValue).join(",");
    const dataRows = data.map((item) =>
      keys.map((key) => {
        const val = item[key];
        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("createdat")) {
          return formatCsvValue(formatDate(val));
        }
        return formatCsvValue(val);
      }).join(",")
    );

    const bom = "\uFEFF";
    const csv = bom + [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setTimeout(() => setExporting(false), 500);
  }

  if (data.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {exporting ? "Exporting..." : "Export CSV"}
    </button>
  );
}
