import { test, expect } from "@playwright/test";

test("home page renders hero section", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});

test("navigation to login works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).first().click();
  await expect(page).toHaveURL(/login/);
});
