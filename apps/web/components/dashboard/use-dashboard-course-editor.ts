"use client";

import { FormEvent, useState } from "react";
import type { ToastTone } from "../ui/toast";
import { readErrorMessage } from "../../lib/http";
import type { DashboardCourse } from "./types";

type EditableCourse = Pick<DashboardCourse, "id" | "title" | "description">;

type UseDashboardCourseEditorParams = {
  onSaved: () => Promise<void>;
  onToast: (tone: ToastTone, message: string) => void;
};

export function useDashboardCourseEditor({
  onSaved,
  onToast,
}: UseDashboardCourseEditorParams) {
  const [courseToEdit, setCourseToEdit] = useState<EditableCourse | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  function openEditCourse(course: EditableCourse) {
    setCourseToEdit(course);
    setEditTitle(course.title);
    setEditDescription(course.description ?? "");
  }

  function closeEditCourse() {
    if (editBusy) {
      return;
    }

    setCourseToEdit(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleEditCourse(event: FormEvent) {
    event.preventDefault();
    if (!courseToEdit) {
      return;
    }

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      onToast("error", "Course title is required.");
      return;
    }

    const trimmedDescription = editDescription.trim();
    setEditBusy(true);
    const response = await fetch(`/api/courses/${courseToEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trimmedTitle,
        description: trimmedDescription || null,
      }),
    });
    setEditBusy(false);

    if (!response.ok) {
      onToast("error", await readErrorMessage(response, "Could not update course."));
      return;
    }

    closeEditCourse();
    await onSaved();
    onToast("success", "Course updated.");
  }

  return {
    courseToEdit,
    editTitle,
    editDescription,
    editBusy,
    openEditCourse,
    closeEditCourse,
    handleEditCourse,
    setEditTitle,
    setEditDescription,
  };
}
