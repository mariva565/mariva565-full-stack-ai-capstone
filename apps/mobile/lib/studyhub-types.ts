export type Course = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
};

export type Module = {
  id: number;
  courseId?: number;
  title: string;
  description?: string | null;
  orderIndex: number;
};

export type ModuleContext = {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
};

export type Material = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
  createdAt?: string;
};
