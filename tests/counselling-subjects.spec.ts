import { test, expect } from "@playwright/test";

async function startAtSubjects(page: import("@playwright/test").Page) {
  await page.goto("/start");
  await page.getByRole("link", { name: "Start counselling" }).click();
  await page.getByText("I’m currently in Class 10", { exact: true }).click();
  await page.getByText("I’m waiting for results", { exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByText("Science", { exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Which subjects do you enjoy the most?" })).toBeVisible();
}

test("Subjects uses grouped choices, keeps selections and Other text, and saves the existing answer key", async ({ page }) => {
  await startAtSubjects(page);
  await expect(page.getByRole("main").locator("header").getByText("Step 2 of 5")).toBeVisible();
  await page.screenshot({ path: "/tmp/careerbridge-subjects-default.png", fullPage: true });
  await expect(page.getByRole("button", { name: /Science and mathematics.*0 selected/ })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: /Science and mathematics.*0 selected/ }).click();
  const physics = page.getByRole("checkbox", { name: "Physics" });
  await physics.focus();
  await page.keyboard.press("Space");
  await page.getByRole("checkbox", { name: "Biology" }).check();
  await expect(page.getByRole("button", { name: /Science and mathematics.*2 selected/ })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("2 subjects selected", { exact: true })).toBeVisible();
  await page.screenshot({ path: "/tmp/careerbridge-subjects-step6-expanded.png", fullPage: true });
  await page.getByRole("button", { name: /Science and mathematics.*2 selected/ }).click();
  await expect(page.getByRole("checkbox", { name: "Physics" })).toHaveCount(0);
  await page.getByRole("button", { name: /Science and mathematics.*2 selected/ }).click();
  await expect(page.getByRole("checkbox", { name: "Physics" })).toBeChecked();
  await page.getByRole("checkbox", { name: "Something else" }).check();
  await page.getByLabel(/Tell us what else you enjoy/).fill("Robotics and repairing radios");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "What kinds of things genuinely interest you?" })).toBeVisible();
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.subjects_enjoy.values).toEqual(["physics", "biology", "other"]);
  expect(saved.answers.subjects_enjoy.text).toBe("Robotics and repairing radios");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Which subjects do you enjoy the most?" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Science and mathematics.*2 selected/ })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("2 subjects selected", { exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Physics" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Biology" })).toBeChecked();
  await expect(page.getByLabel(/Tell us what else you enjoy/)).toHaveValue("Robotics and repairing radios");
});

test("Subjects accepts Not sure yet and remains usable at mobile width", async ({ page }) => {
  await startAtSubjects(page);
  await page.getByRole("radio", { name: "I’m not sure yet" }).check();
  await expect(page.getByText("That’s okay. You can explore possibilities before deciding.")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("I’m not sure yet", { exact: true })).toBeVisible();
  await expect(page.locator(".cb-counselling-actions")).toHaveCSS("position", "static");
  await page.screenshot({ path: "/tmp/careerbridge-subjects-mobile.png", fullPage: true });
  const scrollWidth = await page.locator("body").evaluate((element) => element.scrollWidth);
  const clientWidth = await page.locator("body").evaluate((element) => element.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.subjects_enjoy.values).toEqual(["not-sure"]);
  expect(saved.answers.subjects_enjoy.text).toBeNull();
});
