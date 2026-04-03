import type { ModuleInfo } from "../course/module-section";
import type { CourseMaterial } from "../../lib/course-materials";

export type ModuleWorkspaceCourse = {
  id: number;
  title: string;
  description: string | null;
};

export type ModuleFavoriteItem = {
  id: number;
  materialId: number;
  materialTitle: string;
  materialType: string;
  tags: string | null;
  moduleId: number;
  moduleTitle: string;
  courseId: number;
  courseTitle: string;
};

export type ModuleWorkspaceData = {
  course: ModuleWorkspaceCourse;
  module: ModuleInfo;
  modules: ModuleInfo[];
  materials: CourseMaterial[];
  favorites: ModuleFavoriteItem[];
};
