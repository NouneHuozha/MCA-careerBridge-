import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test("study routes guide switches starting points and exposes linked route information", async ({ page }) => {
  await page.goto("/pathways");
  await expect(page.getByRole("heading", { level: 1, name: "Study routes after Class 10 or Class 12" })).toBeVisible();

  await page.getByRole("button", { name: /After Class 12 Courses and professional routes/ }).click();
  await expect(page.getByRole("button", { name: /After Class 12 Courses and professional routes/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /Class 12 \(Science\) → B\.Tech Computer Science → Technology career/ }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Class 12 (Science) → B.Tech Computer Science → Technology career" })).toBeVisible();
  await expect(page.getByRole("link", { name: "B.Tech Computer Science & Engineering" })).toHaveAttribute("href", "/courses/btech-cse");
  await expect(page.getByRole("link", { name: "JEE Main" })).toHaveAttribute("href", "/exams/jee-main");
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Study routes after Class 10 or Class 12" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
