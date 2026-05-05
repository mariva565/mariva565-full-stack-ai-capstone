import { cleanTestDb } from "./setup";
import { authHeader, BASE_URL, loginUser, registerUser } from "./helpers";

async function postJson(pathname: string, body: unknown) {
  return fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function parseJson(res: Response) {
  return res.json() as Promise<Record<string, any>>;
}

describe("auth API integration", () => {
  beforeEach(async () => {
    await cleanTestDb();
  });

  describe("POST /api/auth/register", () => {
    it("creates a user with valid data", async () => {
      const res = await postJson("/api/auth/register", {
        email: "new-user@example.com",
        name: "New User",
        password: "Test1234!strong",
      });
      const body = await parseJson(res);

      expect(res.status).toBe(201);
      expect(typeof body.token).toBe("string");
      expect(body.user).toMatchObject({
        email: "new-user@example.com",
        role: "user",
      });
      expect(typeof body.user.id).toBe("number");
    });

    it("rejects missing fields", async () => {
      const res = await postJson("/api/auth/register", {});
      const body = await parseJson(res);

      expect(res.status).toBe(400);
      expect(body.code).toBe("MISSING_FIELDS");
    });

    it("rejects invalid email", async () => {
      const res = await postJson("/api/auth/register", {
        email: "not-an-email",
        name: "Test User",
        password: "Test1234!strong",
      });
      const body = await parseJson(res);

      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_EMAIL");
    });

    it("rejects weak password", async () => {
      const res = await postJson("/api/auth/register", {
        email: "weak-password@example.com",
        name: "Test User",
        password: "short",
      });
      const body = await parseJson(res);

      expect(res.status).toBe(400);
      expect(body.code).toBe("WEAK_PASSWORD");
    });

    it("rejects duplicate email", async () => {
      await registerUser({ email: "duplicate@example.com" });

      const res = await postJson("/api/auth/register", {
        email: "duplicate@example.com",
        name: "Duplicate User",
        password: "Test1234!strong",
      });
      const body = await parseJson(res);

      expect(res.status).toBe(409);
      expect(body.code).toBe("EMAIL_EXISTS");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns a token for valid credentials", async () => {
      const user = await registerUser({
        email: "login-success@example.com",
        password: "Test1234!strong",
      });

      const result = await loginUser(user.email, user.password);

      expect(typeof result.token).toBe("string");
      expect(result.token.split(".")).toHaveLength(3);
    });

    it("rejects wrong password", async () => {
      await registerUser({
        email: "wrong-password@example.com",
        password: "Test1234!strong",
      });

      const res = await postJson("/api/auth/login", {
        email: "wrong-password@example.com",
        password: "Wrong1234!strong",
      });
      const body = await parseJson(res);

      expect(res.status).toBe(401);
      expect(body.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects non-existent email", async () => {
      const res = await postJson("/api/auth/login", {
        email: "missing@example.com",
        password: "Test1234!strong",
      });
      const body = await parseJson(res);

      expect(res.status).toBe(401);
      expect(body.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the profile for a valid Bearer token", async () => {
      const user = await registerUser({
        email: "me-success@example.com",
        name: "Me Success",
      });

      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: authHeader(user.token),
      });
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.user).toMatchObject({
        id: user.userId,
        email: user.email,
        name: user.name,
        role: "user",
      });
    });

    it("rejects requests without a token", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`);
      const body = await parseJson(res);

      expect(res.status).toBe(401);
      expect(body.code).toBe("NOT_AUTHENTICATED");
    });

    it("rejects invalid Bearer tokens", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: authHeader("not-a-real-token"),
      });
      const body = await parseJson(res);

      expect(res.status).toBe(401);
      expect(body.code).toBe("INVALID_TOKEN");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the auth cookie", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST" });
      const body = await parseJson(res);

      expect(res.status).toBe(200);
      expect(body.message).toBe("Logged out");
      expect(res.headers.get("set-cookie")).toContain("token=");
    });
  });
});
