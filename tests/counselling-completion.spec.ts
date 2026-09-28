import { test, expect } from "@playwright/test";

const answers: [string, string[]][] = [
  ["subjects_enjoy", ["mathematics"]],
  ["stream_intent", ["science"]],
  ["interests", ["technology"]],
  ["strengths", ["problem-solving"]],
  ["goals", ["technology"]],
  ["values", ["learning"]],
  ["location_pref", ["within-nagaland"]],
  ["budget", ["low"]],
];

test("completed counselling presents the transition and supports review, correction, and return", async ({ page }) => {
  for (const [questionKey, values] of answers) {
    const response = await page.request.post("/api/counselling", { data: { action: "answer", stage: "class10", questionKey, values } });
    expect(response.ok()).toBeTruthy();
  }
  const completed = await page.request.post("/api/counselling", { data: { action: "complete" } });
  expect(completed.ok()).toBeTruthy();

  await page.goto("/counselling/complete");
  await expect(page.getByRole("heading", { name: "We’ve finished getting to know you" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Save and come back later" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Review what we understood" })).toHaveAttribute("href", "/reflection");
  await expect(page.getByText("This is a starting point, not a final judgement.")).toBeVisible();
  await page.screenshot({ path: "/tmp/cb-transition-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
  await page.screenshot({ path: "/tmp/cb-transition-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile personalized guidance" });
  await expect(mobileNav.getByRole("link", { name: "My Guidance" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Explore Library" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(mobileNav).toHaveCount(0);

  await page.getByRole("link", { name: "I need to change something first" }).click();
  await expect(page).toHaveURL(/\/counselling\?edit=budget&returnTo=/);
  const savedAnswers = await (await page.request.get("/api/counselling")).json();
  expect(savedAnswers.answers.budget.values).toContain("low");
  await page.getByRole("button", { name: /^Moderate fees are possible/ }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page).toHaveURL(/\/counselling\/complete$/);
  const updatedAnswers = await (await page.request.get("/api/counselling")).json();
  expect(updatedAnswers.answers.budget.values).toContain("moderate");

  await page.getByRole("link", { name: "Review what we understood" }).click();
  await expect(page).toHaveURL(/\/reflection$/);
  await expect(page.getByRole("heading", { name: "What we learned about you" })).toBeVisible();
});
