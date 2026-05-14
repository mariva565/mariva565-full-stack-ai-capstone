export type PaginationOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

const DEFAULT_LIMIT = 20;
const DEFAULT_MAX_LIMIT = 200;

function parsePositiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function readPaginationParams(
  searchParams: URLSearchParams,
  options: PaginationOptions = {}
): PaginationParams {
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? DEFAULT_MAX_LIMIT;
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const requestedLimit = parsePositiveInteger(searchParams.get("limit"), defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function buildPageMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}

export function normalizeSearch(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
