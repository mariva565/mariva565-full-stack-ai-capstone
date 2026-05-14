import { eq } from "drizzle-orm";

import { users } from "../../../../../drizzle/schema";
import { cleanTestDb, testDb } from "./setup";
import { authHeader, BASE_URL, registerUser } from "./helpers";

type TestUser = Awaited<ReturnType<typeof registerUser>>;

async function parseJson(res: Response) {
  return res.json() as Promise<Record<string, any>>;
}

describe("admin pagination integration", () => {
  let admin: TestUser;

  beforeEach(async () => {
    await cleanTestDb();
    admin = await registerUser({ name: "Admin User" });
    await testDb.update(users).set({ role: "admin" }).where(eq(users.id, admin.userId));
  });

  it("paginates and searches admin users server-side", async () => {
    await registerUser({ name: "Ada Lovelace", email: "ada@example.com" });
    await registerUser({ name: "Grace Hopper", email: "grace@example.com" });
    await registerUser({ name: "Alan Turing", email: "alan@example.com" });

    const firstPageRes = await fetch(`${BASE_URL}/api/admin/users?page=1&limit=2`, {
      headers: authHeader(admin.token),
    });
    const searchRes = await fetch(`${BASE_URL}/api/admin/users?page=1&limit=2&search=Grace`, {
      headers: authHeader(admin.token),
    });
    const firstPage = await parseJson(firstPageRes);
    const searchPage = await parseJson(searchRes);

    expect(firstPageRes.status).toBe(200);
    expect(firstPage.users).toHaveLength(2);
    expect(firstPage).toMatchObject({ page: 1, limit: 2, total: 4, hasMore: true });

    expect(searchRes.status).toBe(200);
    expect(searchPage.users).toHaveLength(1);
    expect(searchPage.users[0]).toMatchObject({ name: "Grace Hopper" });
    expect(searchPage).toMatchObject({ page: 1, limit: 2, total: 1, hasMore: false });
  });
});
