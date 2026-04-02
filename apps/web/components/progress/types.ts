export type MilestoneStatus = "not_started" | "in_progress" | "done" | "idea";

export type Milestone = {
  id: number;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: string | null;
  completedAt: string | null;
  orderIndex: number;
};

export type MilestoneUpdate = {
  title: string;
  description: string;
  dueDate: string | null;
};

export type ProgressEvent = {
  id: number;
  title: string;
  date: string;
  type: string;
  color: string | null;
};

export type ProgressData = {
  milestones: Milestone[];
  events: ProgressEvent[];
};
