import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  baseURL: "http://localhost:3001",
  timeout: 120_000, // 120s — dev server cold-compiles pages on first visit
  retries: 1,
  workers: 1, // serial — shared DB state
  expect: {
    timeout: 30_000,
  },
  use: {
    headless: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev:test",
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
