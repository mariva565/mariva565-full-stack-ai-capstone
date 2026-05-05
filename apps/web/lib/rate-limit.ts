type LimitStore = Map<string, number[]>;

const stores = new Map<string, LimitStore>();

export function checkRateLimit(
  namespace: string,
  key: string,
  max: number,
  windowMs: number
): boolean {
  if (process.env.NODE_ENV === "test" || process.env.STUDYHUB_TEST_SERVER === "1") {
    return true;
  }

  let store = stores.get(namespace);
  if (!store) {
    store = new Map<string, number[]>();
    stores.set(namespace, store);
  }

  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (store.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (timestamps.length >= max) {
    store.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return true;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
