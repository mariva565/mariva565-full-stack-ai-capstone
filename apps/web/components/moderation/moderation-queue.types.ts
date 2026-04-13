export type ModerationRole = "admin" | "mentor";

export type ModerationPost = {
  id: number;
  title: string;
  postType: string;
  status: string;
  isPinned: boolean;
  questionStatus: string | null;
  courseTitle: string | null;
  authorName: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type StatusCounts = {
  pending: number;
  approved: number;
  hidden: number;
};

export type QueueResponse = {
  posts?: ModerationPost[];
  page?: number;
  hasMore?: boolean;
  statusCounts?: Partial<StatusCounts>;
};

