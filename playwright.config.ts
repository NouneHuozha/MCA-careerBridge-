import { defineConfig } from "@playwright/test";

/** Run against the platform-managed production preview; never start a second server. */
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "/tmp/careerbridge-test-results",
  use: {
    baseURL: process.env.CAREERBRIDGE_TEST_URL ?? "http://localhost:3000",
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
});
