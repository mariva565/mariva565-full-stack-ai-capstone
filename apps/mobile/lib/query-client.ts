import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { ApiError } from "./api";

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const REACT_QUERY_PERSIST_KEY = "studyhub_react_query_cache_v1";
export const REACT_QUERY_MAX_AGE_MS = 24 * ONE_HOUR_MS;

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (!(error instanceof ApiError)) {
    return true;
  }

  if (
    error.kind === "auth" ||
    error.kind === "forbidden" ||
    error.kind === "validation" ||
    error.kind === "not_found"
  ) {
    return false;
  }

  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: 30 * ONE_SECOND_MS,
      gcTime: REACT_QUERY_MAX_AGE_MS,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: REACT_QUERY_PERSIST_KEY,
  throttleTime: ONE_SECOND_MS,
});
