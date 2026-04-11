export type DashboardCourse = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
};

export type PinnedMaterial = {
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

export type DashboardData = {
  courses: DashboardCourse[];
  favorites: PinnedMaterial[];
  moduleCount: number;
  materialCount: number;
};
