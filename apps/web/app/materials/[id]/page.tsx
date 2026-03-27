"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
};

export default function MaterialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  async function fetchMaterial() {
    const res = await fetch(`/api/materials/${id}`);
    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) { router.push("/dashboard"); return; }
    const data = await res.json();
    setMaterial(data.material);
    setTitle(data.material.title);
    setContent(data.material.content || "");
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      setEditing(false);
      fetchMaterial();
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this material?")) return;
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => router.back()}
        className="text-sm text-brand-500 hover:text-brand-700 dark:text-brand-100"
      >
        &larr; Back
      </button>

      {editing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setTitle(material!.title); setContent(material!.content || ""); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-4 flex items-start justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {material?.title}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-brand-500 hover:text-brand-700 dark:text-brand-100"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>

          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {material?.materialType}
          </span>

          {material?.content ? (
            <div className="mt-6 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {material.content}
            </div>
          ) : (
            <p className="mt-6 text-slate-400">No content yet. Click Edit to add.</p>
          )}

          {material?.fileUrl && (
            <div className="mt-4">
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-500 hover:text-brand-700 dark:text-brand-100"
              >
                View attached file &rarr;
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
