"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      setTitle("");
      setDescription("");
      setShowForm(false);
      fetchCourses();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this course?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    fetchCourses();
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Courses
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? "Cancel" : "+ New Course"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
        >
          <div>
            <label htmlFor="course-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              id="course-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="course-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Create Course
          </button>
        </form>
      )}

      {courses.length === 0 ? (
        <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
          No courses yet. Create your first one!
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <Link
                  href={`/courses/${course.id}`}
                  className="text-lg font-semibold text-slate-900 hover:text-brand-500 dark:text-white dark:hover:text-brand-100"
                >
                  {course.title}
                </Link>
                <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {course.status}
                </span>
              </div>
              {course.description && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {course.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={`/courses/${course.id}`}
                  className="text-sm font-medium text-brand-500 hover:text-brand-700 dark:text-brand-100"
                >
                  Open
                </Link>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
