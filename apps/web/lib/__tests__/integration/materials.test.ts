import { cleanTestDb } from "./setup";
import { authHeader, BASE_URL, registerUser } from "./helpers";

type TestUser = Awaited<ReturnType<typeof registerUser>>;

async function parseJson(res: Response) {
  return res.json() as Promise<Record<string, any>>;
}

async function createCourse(token: string) {
  const res = await fetch(`${BASE_URL}/api/courses`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({
      title: "Materials Parent Course",
      description: "Parent course for material tests",
    }),
  });
  const body = await parseJson(res);

  if (res.status !== 201) {
    throw new Error(`Create course failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return body.course as Record<string, any>;
}

async function createModule(courseId: number, token: string) {
  const res = await fetch(`${BASE_URL}/api/courses/${courseId}/modules`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({
      title: "Materials Parent Module",
      description: "Parent module for material tests",
      orderIndex: 1,
    }),
  });
  const body = await parseJson(res);

  if (res.status !== 201) {
    throw new Error(`Create module failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return body.module as Record<string, any>;
}

async function createMaterial(moduleId: number, token: string, overrides?: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/modules/${moduleId}/materials`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({
      title: "Quantum Notes",
      materialType: "note",
      content: "Quantum entanglement summary for search coverage.",
      tags: "physics, quantum",
      ...overrides,
    }),
  });
  const body = await parseJson(res);

  if (res.status !== 201) {
    throw new Error(`Create material failed (${res.status}): ${body.message ?? "Unknown error"}`);
  }

  return body.material as Record<string, any>;
}

async function createLearningPath(token: string) {
  const course = await createCourse(token);
  const mod = await createModule(course.id, token);

  return { course, mod };
}

describe("materials API integration", () => {
  let user: TestUser;

  beforeEach(async () => {
    await cleanTestDb();
    user = await registerUser({ name: "Material Creator" });
  });

  it("creates a note material inside a module", async () => {
    const { mod } = await createLearningPath(user.token);

    const res = await fetch(`${BASE_URL}/api/modules/${mod.id}/materials`, {
      method: "POST",
      headers: authHeader(user.token),
      body: JSON.stringify({
        title: "HTTP Status Notes",
        materialType: "note",
        content: "A compact guide to 2xx, 4xx, and 5xx responses.",
        tags: "http, backend",
      }),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(201);
    expect(body.material).toMatchObject({
      moduleId: mod.id,
      title: "HTTP Status Notes",
      materialType: "note",
      content: "A compact guide to 2xx, 4xx, and 5xx responses.",
      tags: "http, backend",
      createdBy: user.userId,
    });
  });

  it("retrieves a material by id", async () => {
    const { course, mod } = await createLearningPath(user.token);
    const material = await createMaterial(mod.id, user.token, { title: "Retrieval Notes" });

    const res = await fetch(`${BASE_URL}/api/materials/${material.id}`, {
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.material).toMatchObject({
      id: material.id,
      title: "Retrieval Notes",
      moduleId: mod.id,
      materialType: "note",
    });
    expect(body.module).toMatchObject({ id: mod.id, courseId: course.id });
    expect(body.course).toMatchObject({ id: course.id });
    expect(body.isOwner).toBe(true);
  });

  it("allows the owner to update a material", async () => {
    const { mod } = await createLearningPath(user.token);
    const material = await createMaterial(mod.id, user.token);

    const res = await fetch(`${BASE_URL}/api/materials/${material.id}`, {
      method: "PUT",
      headers: authHeader(user.token),
      body: JSON.stringify({
        title: "Updated Quantum Notes",
        content: "Updated note body for integration coverage.",
        materialType: "note",
        tags: "updated, quantum",
      }),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.material).toMatchObject({
      id: material.id,
      title: "Updated Quantum Notes",
      content: "Updated note body for integration coverage.",
      tags: "updated, quantum",
    });
  });

  it("allows the owner to delete a material", async () => {
    const { mod } = await createLearningPath(user.token);
    const material = await createMaterial(mod.id, user.token);

    const res = await fetch(`${BASE_URL}/api/materials/${material.id}`, {
      method: "DELETE",
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.message).toBe("Material deleted");
  });

  it("searches the authenticated user's materials by query", async () => {
    const { mod } = await createLearningPath(user.token);
    const material = await createMaterial(mod.id, user.token, {
      title: "Quantum Search Notes",
      content: "Entanglement and wave functions make this result searchable.",
    });
    await createMaterial(mod.id, user.token, {
      title: "Algebra Notes",
      content: "Linear equations and matrices.",
      tags: "math",
    });

    const res = await fetch(`${BASE_URL}/api/materials/search?q=quantum`, {
      headers: authHeader(user.token),
    });
    const body = await parseJson(res);

    expect(res.status).toBe(200);
    expect(body.query).toBe("quantum");
    expect(body.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: material.id,
          title: "Quantum Search Notes",
          url: `/materials/${material.id}`,
        }),
      ])
    );
  });
});
