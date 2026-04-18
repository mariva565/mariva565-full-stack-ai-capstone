export type Post = {
  id: number;
  title: string;
  content: string;
  postType: string;
  status: string;
  isPinned: boolean;
  questionStatus: string | null;
  courseId: number | null;
  courseTitle: string | null;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  commentCount?: number;
  isLiked: boolean;
  isBookmarked: boolean;
};

export type Comment = {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
};

export const TYPE_LABELS: Record<string, string> = {
  discussion: "Discussion",
  question:   "Question",
  resource:   "Resource",
  article:    "Article",
};

export const TYPE_COLORS: Record<string, string> = {
  discussion: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  question:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  resource:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  article:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
