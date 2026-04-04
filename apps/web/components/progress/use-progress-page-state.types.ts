import type { ToastTone } from "../ui/toast";
import type { TimelineFilter } from "./timeline-filters";
import type {
  Milestone,
  ProgressData,
  ProgressEvent,
} from "./types";

export type ToastState = {
  message: string;
  tone: ToastTone;
};

export type MilestonesResponse = {
  milestones: Milestone[];
};

export type MilestoneResponse = {
  milestone?: Milestone;
};

export type EventsResponse = {
  events: ProgressEvent[];
};

export type MilestonePatchPayload = Partial<{
  title: string;
  description: string | null;
  status: Milestone["status"];
  dueDate: string | null;
  orderIndex: number;
}>;

export type FilterOption = {
  id: TimelineFilter;
  label: string;
  count: number;
};

export type ProgressLoadResult = {
  errorMessage: string | null;
  events: ProgressEvent[];
  milestones: Milestone[];
  redirectToLogin: boolean;
};

export type UseProgressPageStateParams = {
  initialData: ProgressData;
};
