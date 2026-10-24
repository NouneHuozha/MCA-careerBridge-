import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, page: document.documentElement.scrollWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test("route detail explains a route step by step and preserves real linked resources", async ({ page }) => {
  await page.goto("/pathways/class10-iti-trade");

  await expect(page.getByRole("heading", { level: 1, name: "ITI trade" })).toBeVisible();
  await page.getByRole("button", { name: "Apprenticeship" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Apprenticeship" })).toBeVisible();
  await expect(page.getByText("Practical experience under an employer builds credibility.")).toBeVisible();

  await page.getByRole("button", { name: /Courses to explore/ }).click();
  await expect(page.getByRole("link", { name: "ITI — Electrician trade" })).toHaveAttribute("href", "/courses/iti-electrician");
  await page.getByRole("button", { name: /Where to study/ }).click();
  await expect(page.getByRole("link", { name: "Industrial Training Institute (ITI), Dimapur" })).toHaveAttribute("href", "/institutions/NL-ITI-015");
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "ITI trade" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
