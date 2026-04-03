import type { ModuleInfo } from "./module-section";

export type CourseSummary = {
  id: number;
  title: string;
  description: string | null;
};

export type CourseDetailsData = {
  course: CourseSummary;
  modules: ModuleInfo[];
};
