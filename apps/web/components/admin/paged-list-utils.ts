export type PagedListParams = {
  page?: number;
  limit?: number;
  search?: string;
  viewAs?: string;
  courseId?: string;
};

type PagedPayload<T> = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
} & Record<string, T[] | number | boolean>;

export function buildPagedListUrl(path: string, params: PagedListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.search?.trim()) searchParams.set("search", params.search.trim());
  if (params.viewAs && params.viewAs !== "all") searchParams.set("viewAs", params.viewAs);
  if (params.courseId) searchParams.set("courseId", params.courseId);

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export async function fetchAllPagedItems<T>(
  path: string,
  key: string,
  params: Omit<PagedListParams, "page" | "limit"> = {}
): Promise<T[]> {
  const rows: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(buildPagedListUrl(path, { ...params, page, limit: 200 }));
    if (!response.ok) {
      throw new Error("Failed to export filtered data.");
    }

    const payload = (await response.json()) as PagedPayload<T>;
    rows.push(...(((payload[key] as T[] | undefined) ?? [])));
    hasMore = Boolean(payload.hasMore);
    page += 1;
  }

  return rows;
}
