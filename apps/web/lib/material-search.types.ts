export type MaterialSearchTerms = {
  normalizedQuery: string;
  tokens: string[];
  phrases: string[];
};

export type MaterialSearchCandidate = {
  id: number;
  title: string;
  content: string | null;
  tags: string | null;
  createdAt: Date | string;
  moduleTitle: string;
  courseTitle: string;
};

export type MaterialSearchResult = {
  id: number;
  title: string;
  moduleTitle: string;
  courseTitle: string;
  snippet: string;
  score: number;
  url: string;
};

export type MaterialSearchRanked = MaterialSearchResult & {
  createdAtTime: number;
};
