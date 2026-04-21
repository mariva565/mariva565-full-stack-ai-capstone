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

export type SharedMaterial = {
  id: number;
  title: string;
  materialType: string;
  fileUrl: string | null;
  createdAt: string;
  sharedAt: string;
  sharedBy: { email: string | null; name: string | null };
  context: string;
  snippet: string | null;
};

export type DashboardData = {
  courses: DashboardCourse[];
  favorites: PinnedMaterial[];
  shared: SharedMaterial[];
  moduleCount: number;
  materialCount: number;
};
