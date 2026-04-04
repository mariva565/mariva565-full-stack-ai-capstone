import type { Milestone } from "./types";
import type {
  EventsResponse,
  MilestonePatchPayload,
  MilestoneResponse,
  MilestonesResponse,
  ProgressLoadResult,
} from "./use-progress-page-state.types";

const REQUEST_TIMEOUT_MS = 12000;

export function timeoutMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Request timed out. Check dev server and try again.";
  }

  return null;
}

export async function fetchWithTimeout(input: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function loadProgressSnapshot(): Promise<ProgressLoadResult> {
  try {
    const [milestonesResult, eventsResult] = await Promise.allSettled([
      fetchWithTimeout("/api/milestones"),
      fetchWithTimeout("/api/events"),
    ]);

    if (milestonesResult.status === "rejected") {
      return {
        errorMessage:
          timeoutMessage(milestonesResult.reason) ?? "Could not load progress items.",
        events: [],
        milestones: [],
        redirectToLogin: false,
      };
    }

    const milestonesResponse = milestonesResult.value;
    if (milestonesResponse.status === 401) {
      return {
        errorMessage: null,
        events: [],
        milestones: [],
        redirectToLogin: true,
      };
    }

    if (!milestonesResponse.ok) {
      return {
        errorMessage: "Could not load progress items.",
        events: [],
        milestones: [],
        redirectToLogin: false,
      };
    }

    const milestonesPayload =
      ((await milestonesResponse.json()) as MilestonesResponse).milestones ?? [];

    if (eventsResult.status === "rejected") {
      return {
        errorMessage: null,
        events: [],
        milestones: milestonesPayload,
        redirectToLogin: false,
      };
    }

    const eventsResponse = eventsResult.value;
    if (eventsResponse.status === 401) {
      return {
        errorMessage: null,
        events: [],
        milestones: [],
        redirectToLogin: true,
      };
    }

    if (!eventsResponse.ok) {
      return {
        errorMessage: null,
        events: [],
        milestones: milestonesPayload,
        redirectToLogin: false,
      };
    }

    return {
      errorMessage: null,
      events: ((await eventsResponse.json()) as EventsResponse).events ?? [],
      milestones: milestonesPayload,
      redirectToLogin: false,
    };
  } catch (error) {
    return {
      errorMessage: timeoutMessage(error) ?? "Could not load progress items.",
      events: [],
      milestones: [],
      redirectToLogin: false,
    };
  }
}

export async function patchMilestoneRequest(
  id: number,
  payload: MilestonePatchPayload
): Promise<Milestone | null> {
  try {
    const response = await fetchWithTimeout(`/api/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    return ((await response.json()) as MilestoneResponse).milestone ?? null;
  } catch {
    return null;
  }
}
