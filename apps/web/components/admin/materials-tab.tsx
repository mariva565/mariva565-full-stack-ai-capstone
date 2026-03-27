"use client";

import { useEffect, useState } from "react";

type AdminMaterial = {
  id: number;
  title: string;
  materialType: string;
  createdAt: string;
  moduleTitle: string;
  courseTitle: string;
  authorName: string;
  authorEmail: string;
};

export function MaterialsTab() {
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    const res = await fetch("/api/admin/materials");
    if (res.ok) {
      const data = await res.json();
      setMaterials(data.materials || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete material "${title}"?`)) return;
    const res = await fetch(`/api/admin/materials/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  }

  if (loading) {
    return <p className="text-slate-500 dark:text-slate-400">Loading materials...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Title</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Course</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Author</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Created</th>
            <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {materials.map((mat) => (
            <tr key={mat.id}>
              <td className="py-3 font-medium text-slate-900 dark:text-white">
                {mat.title}
              </td>
              <td className="py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {mat.materialType}
                </span>
              </td>
              <td className="py-3 text-slate-600 dark:text-slate-400">
                {mat.courseTitle}
              </td>
              <td className="py-3 text-slate-600 dark:text-slate-400">
                {mat.authorName}
              </td>
              <td className="py-3 text-slate-500 dark:text-slate-400">
                {new Date(mat.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3">
                <button
                  onClick={() => handleDelete(mat.id, mat.title)}
                  className="text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {materials.length === 0 && (
        <p className="mt-4 text-center text-slate-500 dark:text-slate-400">
          No materials found.
        </p>
      )}
    </div>
  );
}
