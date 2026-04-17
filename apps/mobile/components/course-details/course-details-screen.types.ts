import type { Course, Module } from "../../lib/studyhub-types";

export type ConfirmTarget =
  | { type: "course" }
  | { type: "module"; module: Module }
  | null;

export type ConfirmCopy = {
  title: string;
  message: string;
};

export type CourseFetchState = {
  course: Course | null;
  modules: Module[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  refresh: () => void;
};

export type ConfirmDialogState = {
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  openDeleteCourse: () => void;
  openDeleteModule: (module: Module) => void;
  closeConfirm: () => void;
  confirmDelete: () => void;
};

export type CourseDetailsViewModel = {
  routeId: string;
  course: Course | null;
  modules: Module[];
  loading: boolean;
  refreshing: boolean;
  error: string;
  confirmVisible: boolean;
  confirmTitle: string;
  confirmMessage: string;
  retry: () => void;
  refresh: () => void;
  openDeleteCourse: () => void;
  openDeleteModule: (module: Module) => void;
  confirmDelete: () => void;
  closeConfirm: () => void;
};
