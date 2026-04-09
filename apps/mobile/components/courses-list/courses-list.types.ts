import type { Course } from "../../lib/studyhub-types";

export type CoursesStats = {
  courses: number;
  modules: number;
  materials: number;
};

export type CoursesListViewModel = {
  userName: string;
  courses: Course[];
  stats: CoursesStats;
  loading: boolean;
  refreshing: boolean;
  error: string;
  confirmVisible: boolean;
  deleteTargetTitle: string;
  retry: () => void;
  refresh: () => void;
  openCourse: (courseId: number) => void;
  editCourse: (courseId: number) => void;
  openCreateCourse: () => void;
  openDeleteCourse: (course: Course) => void;
  confirmDeleteCourse: () => Promise<void>;
  cancelDeleteCourse: () => void;
};
