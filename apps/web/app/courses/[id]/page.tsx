"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Course = { id: number; title: string; description: string | null };
type Module = { id: number; title: string; orderIndex: number };
type Material = {
  id: number;
  title: string;
  materialType: string;
  content: string | null;
};

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [materialsByModule, setMaterialsByModule] = useState<
    Record<number, Material[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingMaterialFor, setAddingMaterialFor] = useState<number | null>(null);
  const [matTitle, setMatTitle] = useState("");
  const [matContent, setMatContent] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  async function fetchCourse() {
    const res = await fetch(`/api/courses/${id}`);
    if (res.status === 401) { router.push("/login"); return; }
    if (!res.ok) { router.push("/dashboard"); return; }
    const data = await res.json();
    setCourse(data.course);

    const modRes = await fetch(`/api/courses/${id}/modules`);
    const modData = await modRes.json();
    setModules(modData.modules || []);

    // Fetch materials for each module
    const matMap: Record<number, Material[]> = {};
    for (const mod of modData.modules || []) {
      const matRes = await fetch(`/api/modules/${mod.id}/materials`);
      const matData = await matRes.json();
      matMap[mod.id] = matData.materials || [];
    }
    setMaterialsByModule(matMap);
    setLoading(false);
  }

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    await fetch(`/api/courses/${id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModuleTitle, orderIndex: modules.length }),
    });
    setNewModuleTitle("");
    fetchCourse();
  }

  async function handleDeleteModule(moduleId: number) {
    if (!confirm("Delete this module and all its materials?")) return;
    await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    fetchCourse();
  }

  async function handleAddMaterial(moduleId: number, e: React.FormEvent) {
    e.preventDefault();
    if (!matTitle.trim()) return;
    await fetch(`/api/modules/${moduleId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: matTitle, content: matContent }),
    });
    setMatTitle("");
    setMatContent("");
    setAddingMaterialFor(null);
    fetchCourse();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="text-sm text-brand-500 hover:text-brand-700 dark:text-brand-100"
      >
        &larr; Back to courses
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
        {course?.title}
      </h1>
      {course?.description && (
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
      )}

      {/* Add module form */}
      <form onSubmit={handleAddModule} className="mt-6 flex gap-2">
        <input
          type="text"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Module
        </button>
      </form>

      {/* Modules list */}
      <div className="mt-6 space-y-6">
        {modules.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400">
            No modules yet. Add one above.
          </p>
        )}

        {modules.map((mod) => (
          <div
            key={mod.id}
            className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {mod.title}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setAddingMaterialFor(
                      addingMaterialFor === mod.id ? null : mod.id
                    )
                  }
                  className="text-sm text-brand-500 hover:text-brand-700 dark:text-brand-100"
                >
                  + Material
                </button>
                <button
                  onClick={() => handleDeleteModule(mod.id)}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Add material form */}
            {addingMaterialFor === mod.id && (
              <form
                onSubmit={(e) => handleAddMaterial(mod.id, e)}
                className="space-y-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700"
              >
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Material title"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <textarea
                  value={matContent}
                  onChange={(e) => setMatContent(e.target.value)}
                  placeholder="Content (optional)"
                  rows={3}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Add
                </button>
              </form>
            )}

            {/* Materials list */}
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {(materialsByModule[mod.id] || []).map((mat) => (
                <li key={mat.id} className="px-5 py-3">
                  <Link
                    href={`/materials/${mat.id}`}
                    className="text-sm font-medium text-slate-900 hover:text-brand-500 dark:text-white dark:hover:text-brand-100"
                  >
                    {mat.title}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    {mat.materialType}
                  </span>
                </li>
              ))}
              {(materialsByModule[mod.id] || []).length === 0 && (
                <li className="px-5 py-3 text-sm text-slate-400">
                  No materials yet
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
