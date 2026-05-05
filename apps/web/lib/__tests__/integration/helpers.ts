export const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3001";

type RegisterOverrides = {
  email?: string;
  name?: string;
  password?: string;
};

async function readJsonResponse(res: Response) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Expected JSON response, got ${res.status}: ${text.slice(0, 120)}`);
  }
}

export async function registerUser(overrides?: RegisterOverrides) {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const data = {
    email: overrides?.email ?? `test-${uniqueId}@example.com`,
    name: overrides?.name ?? "Test User",
    password: overrides?.password ?? "Test1234!strong",
  };

  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await readJsonResponse(res);

  if (res.status !== 201) {
    throw new Error(`Register failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return { ...data, token: body.token as string, userId: body.user.id as number };
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await readJsonResponse(res);

  if (res.status !== 200) {
    throw new Error(`Login failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return { token: body.token as string };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}
