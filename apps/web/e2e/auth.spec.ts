import { test, expect } from "@playwright/test";
import { seedUser } from "./helpers/seed";

const PASSWORD = "Test1234!strong";

test("register flow — new user can sign up and reach dashboard", async ({ page }) => {
  const email = `e2e-reg-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Full Name").fill("E2E Tester");
  await page.getByLabel("Email").fill(email);
  await page.locator("#password").fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();

  // Wait for success screen first (confirms registration worked)
  await expect(page.getByText("Taking you to your dashboard")).toBeVisible({ timeout: 15_000 });

  // Then wait for redirect — allow extra time for confetti delay (2.4s) + Next.js first compile
  await expect(page).toHaveURL(/dashboard/, { timeout: 60_000 });
});

test.describe("login flow", () => {
  let email: string;

  test.beforeAll(async () => {
    email = `e2e-login-${Date.now()}@example.com`;
    await seedUser(email, "Login Tester", PASSWORD);
  });

  test("correct credentials redirect to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.locator("#password").fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/dashboard/, { timeout: 30_000 });
  });

  test("wrong password shows error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.locator("#password").fill(PASSWORD.replace("!", "?wrong"));
    await page.getByRole("button", { name: /sign in/i }).click();

    // The actual error text is "Hmm, those details don't match. Try again?"
    // rendered in a div with Tailwind red classes (border-red-200, text-red-700)
    await expect(
      page.getByText(/don't match|login failed|try again/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});

test("access protected page without login redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/, { timeout: 15_000 });
});
