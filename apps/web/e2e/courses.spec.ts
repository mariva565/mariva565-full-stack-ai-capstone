import { test, expect, type Page } from "@playwright/test";
import { seedUser } from "./helpers/seed";

const PASSWORD = "Test1234!strong";

/** Fast login via API — sets httpOnly cookie in the browser context */
async function loginViaAPI(page: Page, email: string) {
  const res = await page.request.post("/api/auth/login", {
    data: { email, password: PASSWORD },
  });
  if (!res.ok()) throw new Error(`API login failed: ${res.status()}`);
}

test.describe("Courses, Modules and Materials", () => {
  let email: string;

  test.beforeAll(async () => {
    email = `e2e-courses-${Date.now()}@example.com`;
    await seedUser(email, "Course Tester", PASSWORD);
  });

  test("user can create a course", async ({ page }) => {
    await loginViaAPI(page, email);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // The create-course form is hidden behind a toggle button — click it first
    await page.getByRole("button", { name: /create course/i }).first().click();

    // Wait for the form to appear
    const titleInput = page.locator("#course-title");
    await expect(titleInput).toBeVisible({ timeout: 5_000 });

    // Fill the form
    await titleInput.fill("E2E Playwright Course");
    await page.locator("#course-description").fill("Created by automated E2E test");

    // Submit — the submit button text is "Create Course" (inside the form)
    // Use the form's submit button specifically
    await page.locator("form button[type='submit']").filter({ hasText: /create course/i }).click();

    // Course card should appear — allow time for API + dashboard refresh
    await expect(page.locator("text=E2E Playwright Course")).toBeVisible({ timeout: 30_000 });
  });

  test("user can add a module to a course", async ({ page }) => {
    await loginViaAPI(page, email);

    // Create a course via API for isolation
    const res = await page.request.post("/api/courses", {
      data: { title: "Module Test Course E2E", description: "For module testing" },
    });
    const body = await res.json();
    const courseId = body.course?.id as number;
    expect(courseId).toBeTruthy();

    // Navigate to the course detail page
    await page.goto(`/courses/${courseId}/module-test-course-e2e`);
    await page.waitForLoadState("networkidle");

    // Click "Add module" button
    await page.getByRole("button", { name: /add module/i }).click();

    // Fill the module title (input has placeholder "e.g. React Fundamentals")
    await page.getByPlaceholder("e.g. React Fundamentals").fill("E2E Module Title");

    // Submit
    await page.getByRole("button", { name: /create module/i }).click();

    // Module should appear in the list
    await expect(page.locator("text=E2E Module Title")).toBeVisible({ timeout: 30_000 });
  });

  test("user can add a material (note) to a module", async ({ page }) => {
    await loginViaAPI(page, email);

    // Create a course + module via API for isolation
    const courseRes = await page.request.post("/api/courses", {
      data: { title: "Material Test Course E2E", description: "For material testing" },
    });
    const courseBody = await courseRes.json();
    const courseId = courseBody.course?.id as number;
    expect(courseId).toBeTruthy();

    const modRes = await page.request.post(`/api/courses/${courseId}/modules`, {
      data: { title: "Material Test Module E2E", description: "" },
    });
    const modBody = await modRes.json();
    const moduleId = modBody.module?.id as number;
    expect(moduleId).toBeTruthy();

    // Navigate to the module workspace
    await page.goto(`/modules/${moduleId}/material-test-module-e2e`);
    await page.waitForLoadState("networkidle");

    // Click "Add material" button to toggle the composer form
    await page.getByRole("button", { name: /add material/i }).click();

    // Fill material title (placeholder: "Optional for quick notes")
    await page.getByPlaceholder("Optional for quick notes").fill("E2E Note Title");

    // Fill content — the full placeholder is "Write your study note, summary, or context for the saved link..."
    await page.getByPlaceholder(/write your study note/i).fill("This is an E2E test note content.");

    // Submit (button says "Save note" for note type)
    await page.getByRole("button", { name: /save note/i }).click();

    // Material should appear in the module
    await expect(page.locator("text=E2E Note Title")).toBeVisible({ timeout: 30_000 });
  });
});
