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

test.describe("Posts CRUD", () => {
  let email: string;

  test.beforeAll(async () => {
    email = `e2e-posts-${Date.now()}@example.com`;
    await seedUser(email, "Posts Tester", PASSWORD);
  });

  test("user can create a post on the Community Board", async ({ page }) => {
    await loginViaAPI(page, email);
    await page.goto("/community/new");

    // Fill title
    await page.getByPlaceholder("What's on your mind?").fill("E2E Test Discussion Post");

    // Fill content in Tiptap rich-text editor (.ProseMirror)
    const editor = page.locator(".ProseMirror").first();
    await editor.click();
    await editor.pressSequentially("This is an automated E2E test post content.");

    await page.getByRole("button", { name: /submit post/i }).click();

    // After creation, should be on the post detail page /community/:id
    await expect(page).toHaveURL(/\/community\/\d+$/, { timeout: 15_000 });
    await expect(page.locator("text=E2E Test Discussion Post")).toBeVisible();
  });

  test("user can edit their own post", async ({ page }) => {
    await loginViaAPI(page, email);

    // Create a post via API
    const res = await page.request.post("/api/posts", {
      data: { title: "Post to Edit E2E", content: "<p>Original content</p>", postType: "discussion" },
    });
    const body = await res.json();
    const postId = body.post?.id as number;
    expect(postId).toBeTruthy();

    await page.goto(`/community/${postId}`);
    // Wait for page to fully render before looking for Edit link
    await page.waitForLoadState("networkidle");

    // Click Edit link (visible to author regardless of moderation status)
    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(new RegExp(`/community/${postId}/edit`), { timeout: 10_000 });

    // Update title
    const titleInput = page.getByPlaceholder("What's on your mind?");
    await titleInput.fill("Edited Post Title E2E");
    await page.getByRole("button", { name: /save|update|submit/i }).click();

    // Should show updated title on redirect
    await expect(page.locator("text=Edited Post Title E2E")).toBeVisible({ timeout: 10_000 });
  });

  test("user can delete their own post", async ({ page }) => {
    await loginViaAPI(page, email);

    const res = await page.request.post("/api/posts", {
      data: { title: "Post to Delete E2E", content: "<p>Will be deleted</p>", postType: "discussion" },
    });
    const body = await res.json();
    const postId = body.post?.id as number;
    expect(postId).toBeTruthy();

    await page.goto(`/community/${postId}`);
    await page.waitForLoadState("networkidle");

    // Trigger delete (button that opens confirm modal)
    await page.getByRole("button", { name: /delete/i }).click();

    // Confirm in the modal
    await page.getByRole("button", { name: /^delete$/i }).last().click();

    // After delete, should redirect away from the post
    await expect(page).not.toHaveURL(new RegExp(`/community/${postId}$`), { timeout: 10_000 });
  });
});
