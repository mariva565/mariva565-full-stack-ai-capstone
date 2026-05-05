import { cleanTestDb } from "./setup";
import { authHeader, BASE_URL, registerUser } from "./helpers";

type TestUser = Awaited<ReturnType<typeof registerUser>>;

async function parseJson(res: Response) {
  return res.json() as Promise<Record<string, any>>;
}

async function postJson(pathname: string, token: string, body: unknown) {
  return fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(body),
  });
}

async function createPost(token: string, overrides?: Record<string, unknown>) {
  const res = await postJson("/api/posts", token, {
    title: "Integration discussion",
    content: "<p>Integration post body</p>",
    postType: "discussion",
    ...overrides,
  });
  const body = await parseJson(res);

  if (res.status !== 201) {
    throw new Error(`Create post failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return body.post as Record<string, any>;
}

describe("posts API integration", () => {
  let userA: TestUser;
  let userB: TestUser;

  beforeEach(async () => {
    await cleanTestDb();
    userA = await registerUser({ name: "Posts User A" });
    userB = await registerUser({ name: "Posts User B" });
  });

  it("creates a post for an authenticated user", async () => {
    const res = await postJson("/api/posts", userA.token, {
      title: "First community discussion",
      content: "<p>Let us compare study planning habits.</p>",
      postType: "discussion",
    });
    const body = await parseJson(res);

    expect(res.status).toBe(201);
    expect(body.post).toMatchObject({
      title: "First community discussion",
      content: "<p>Let us compare study planning habits.</p>",
      postType: "discussion",
      status: "pending",
      authorId: userA.userId,
    });
    expect(typeof body.post.id).toBe("number");
  });

  it("lists posts visible to the authenticated author", async () => {
    const post = await createPost(userA.token, { title: "Visible own pending post" });

    const res = await fetch(`${BASE_URL}/api/posts`, {
      headers: authHeader(userA.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.posts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: post.id, title: "Visible own pending post" }),
      ])
    );
    expect(body.page).toBe(1);
    expect(typeof body.hasMore).toBe("boolean");
  });

  it("returns a single post by id", async () => {
    const post = await createPost(userA.token, { title: "Single post lookup" });

    const res = await fetch(`${BASE_URL}/api/posts/${post.id}`, {
      headers: authHeader(userA.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.post).toMatchObject({
      id: post.id,
      title: "Single post lookup",
      authorId: userA.userId,
      isLiked: false,
      isBookmarked: false,
    });
    expect(body.comments).toEqual([]);
  });

  it("allows the owner to edit a post", async () => {
    const post = await createPost(userA.token);

    const res = await fetch(`${BASE_URL}/api/posts/${post.id}`, {
      method: "PUT",
      headers: authHeader(userA.token),
      body: JSON.stringify({
        title: "Edited discussion title",
        content: "<p>Updated discussion body.</p>",
      }),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.post).toMatchObject({
      id: post.id,
      title: "Edited discussion title",
      content: "<p>Updated discussion body.</p>",
    });
  });

  it("rejects edits from non-owners", async () => {
    const post = await createPost(userA.token);

    const res = await fetch(`${BASE_URL}/api/posts/${post.id}`, {
      method: "PUT",
      headers: authHeader(userB.token),
      body: JSON.stringify({ title: "Not allowed" }),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(403);
    expect(body.code).toBe("FORBIDDEN");
  });

  it("allows the owner to delete a post", async () => {
    const post = await createPost(userA.token);

    const res = await fetch(`${BASE_URL}/api/posts/${post.id}`, {
      method: "DELETE",
      headers: authHeader(userA.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("rejects deletes from non-owners", async () => {
    const post = await createPost(userA.token);

    const res = await fetch(`${BASE_URL}/api/posts/${post.id}`, {
      method: "DELETE",
      headers: authHeader(userB.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(403);
    expect(body.code).toBe("FORBIDDEN");
  });

  it("toggles a like for an accessible post", async () => {
    const post = await createPost(userA.token);

    const first = await postJson(`/api/posts/${post.id}/like`, userA.token, {});
    const firstBody = await parseJson(first);
    const second = await postJson(`/api/posts/${post.id}/like`, userA.token, {});
    const secondBody = await parseJson(second);

    expect(first.status).toBe(200);
    expect(firstBody.liked).toBe(true);
    expect(second.status).toBe(200);
    expect(secondBody.liked).toBe(false);
  });

  it("toggles a bookmark for an accessible post", async () => {
    const post = await createPost(userA.token);

    const first = await postJson(`/api/posts/${post.id}/bookmark`, userA.token, {});
    const firstBody = await parseJson(first);
    const second = await postJson(`/api/posts/${post.id}/bookmark`, userA.token, {});
    const secondBody = await parseJson(second);

    expect(first.status).toBe(200);
    expect(firstBody.bookmarked).toBe(true);
    expect(second.status).toBe(200);
    expect(secondBody.bookmarked).toBe(false);
  });
});
