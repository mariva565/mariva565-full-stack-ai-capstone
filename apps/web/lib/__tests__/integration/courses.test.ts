import { cleanTestDb } from "./setup";
import { authHeader, BASE_URL, registerUser } from "./helpers";

type TestUser = Awaited<ReturnType<typeof registerUser>>;

async function parseJson(res: Response) {
  return res.json() as Promise<Record<string, any>>;
}

async function createCourse(token: string, overrides?: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/courses`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({
      title: "Integration Course",
      description: "Course created during integration tests",
      ...overrides,
    }),
  });
  const body = await parseJson(res);

  if (res.status !== 201) {
    throw new Error(`Create course failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return body.course as Record<string, any>;
}

async function createModule(courseId: number, token: string, overrides?: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/courses/${courseId}/modules`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({
      title: "Integration Module",
      description: "Module created during integration tests",
      orderIndex: 1,
      ...overrides,
    }),
  });
  const body = await parseJson(res);

  if (res.status !== 201) {
    throw new Error(`Create module failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return body.module as Record<string, any>;
}

describe("courses API integration", () => {
  let user: TestUser;

  beforeEach(async () => {
    await cleanTestDb();
    user = await registerUser({ name: "Course Creator" });
  });

  it("creates a course for any authenticated user", async () => {
    const res = await fetch(`${BASE_URL}/api/courses`, {
      method: "POST",
      headers: authHeader(user.token),
      body: JSON.stringify({
        title: "Algorithms 101",
        description: "Sorting and searching fundamentals",
      }),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(201);
    expect(body.course).toMatchObject({
      title: "Algorithms 101",
      description: "Sorting and searching fundamentals",
      createdBy: user.userId,
    });
    expect(typeof body.course.id).toBe("number");
  });

  it("lists courses owned by the authenticated user", async () => {
    const course = await createCourse(user.token, { title: "Owned Course" });

    const res = await fetch(`${BASE_URL}/api/courses`, {
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.courses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: course.id, title: "Owned Course" }),
      ])
    );
  });

  it("returns a single course to its creator", async () => {
    const course = await createCourse(user.token, { title: "Course Detail" });

    const res = await fetch(`${BASE_URL}/api/courses/${course.id}`, {
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.course).toMatchObject({
      id: course.id,
      title: "Course Detail",
    });
  });

  it("allows the creator to update a course", async () => {
    const course = await createCourse(user.token);

    const res = await fetch(`${BASE_URL}/api/courses/${course.id}`, {
      method: "PUT",
      headers: authHeader(user.token),
      body: JSON.stringify({
        title: "Updated Course",
        description: "Updated course description",
      }),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.course).toMatchObject({
      id: course.id,
      title: "Updated Course",
      description: "Updated course description",
    });
  });

  it("allows the creator to delete a course", async () => {
    const course = await createCourse(user.token);

    const res = await fetch(`${BASE_URL}/api/courses/${course.id}`, {
      method: "DELETE",
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.message).toBe("Course deleted");
  });

  it("creates a module inside a course", async () => {
    const course = await createCourse(user.token);

    const moduleRes = await fetch(`${BASE_URL}/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: authHeader(user.token),
      body: JSON.stringify({
        title: "Week 1",
        description: "Foundations",
        orderIndex: 2,
      }),
    });
    const body = await parseJson(moduleRes);

    expect(moduleRes.status).toBe(201);
    expect(body.module).toMatchObject({
      courseId: course.id,
      title: "Week 1",
      description: "Foundations",
      orderIndex: 2,
      createdBy: user.userId,
    });
  });

  it("lists modules for an accessible course", async () => {
    const course = await createCourse(user.token);
    const mod = await createModule(course.id, user.token, { title: "Listed Module" });

    const res = await fetch(`${BASE_URL}/api/courses/${course.id}/modules`, {
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.modules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: mod.id, title: "Listed Module", courseId: course.id }),
      ])
    );
  });
});
