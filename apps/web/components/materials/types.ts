import type { SavedAiToolOutput } from "../../lib/ai-tool-outputs";

export type MaterialDetail = {
  id: number;
  title: string;
  content: string | null;
  materialType: string;
  fileUrl: string | null;
  tags: string | null;
  createdAt: string;
  moduleId: number;
};

export type MaterialModuleSummary = {
  id: number;
  title: string;
  courseId: number;
  orderIndex: number;
};

export type MaterialCourseSummary = {
  id: number;
  title: string;
  description: string | null;
};

export type MaterialPageData = {
  material: MaterialDetail;
  module: MaterialModuleSummary;
  course: MaterialCourseSummary;
  isPinned: boolean;
  aiOutputs: SavedAiToolOutput[];
};
