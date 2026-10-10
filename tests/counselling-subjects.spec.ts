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

test("Interests accepts Not sure yet with groups collapsed and reassurance shown", async ({ page }) => {
  await startAtSubjects(page);
  await page.getByRole("checkbox", { name: "Something else" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "What kinds of things genuinely interest you?" })).toBeVisible();

  const unsure = page.getByRole("radio", { name: "I’m not sure yet" });
  await unsure.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("status")).toContainText("That’s okay. You can explore possibilities before deciding.");
  for (const group of ["Health, science, and nature", "Technology, engineering, and making", "People and public life", "Business and communication", "Practical and service work"]) {
    await expect(page.getByRole("button", { name: new RegExp(`${group}.*0 selected`) })).toHaveAttribute("aria-expanded", "false");
  }
  await page.screenshot({ path: "/tmp/careerbridge-interests-not-sure.png", fullPage: true });
  await page.reload();
  await expect(unsure).toBeChecked();
  await expect(page.getByText("That’s okay. You can explore possibilities before deciding.")).toBeVisible();
  for (const group of ["Health, science, and nature", "Technology, engineering, and making", "People and public life", "Business and communication", "Practical and service work"]) {
    await expect(page.getByRole("button", { name: new RegExp(`${group}.*0 selected`) })).toHaveAttribute("aria-expanded", "false");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);

  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.interests.values).toEqual(["not-sure"]);
  expect(saved.answers.interests.text).toBeNull();
  await page.goto("/counselling?edit=interests&returnTo=/counselling");
  await expect(unsure).toBeChecked();
  await expect(page.getByText("That’s okay. You can explore possibilities before deciding.")).toBeVisible();
});

test("Subjects shows the specified grouped options and persists Information Technology", async ({ page }) => {
  await startAtSubjects(page);
  const groups = [
    ["Science and mathematics", ["Science generally", "Mathematics", "Physics", "Chemistry", "Biology"]],
    ["Technology and computing", ["Computer Science", "Information Technology"]],
    ["Languages and society", ["English", "Social Science", "History", "Political Science", "Geography"]],
    ["Business and creative subjects", ["Economics", "Commerce / Accountancy", "Arts / Fine Arts"]],
  ] as const;
  for (const [group, options] of groups) {
    const heading = page.getByRole("button", { name: new RegExp(group) });
    await heading.click();
    for (const option of options) await expect(page.getByRole("checkbox", { name: option })).toBeVisible();
    await heading.click();
  }
  await expect(page.getByRole("checkbox", { name: "Something else" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "I’m not sure yet" })).toBeVisible();

  await page.getByRole("button", { name: /Technology and computing/ }).click();
  await page.getByRole("checkbox", { name: "Information Technology" }).check();
  await expect(page.getByText("1 subject selected", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.subjects_enjoy.values).toEqual(["information-technology"]);

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("button", { name: /Technology and computing.*1 selected/ })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("checkbox", { name: "Information Technology" })).toBeChecked();
});

test("starting again after a completed session opens a fresh flow instead of skipping Subjects", async ({ page }) => {
  await startAtSubjects(page);
  for (const questionKey of ["subjects_enjoy", "interests", "strengths", "work_style", "goals", "values", "location_pref", "budget"]) {
    const response = await page.request.post("/api/counselling", { data: { questionKey, values: ["not-sure"] } });
    expect(response.ok(), `answer ${questionKey}`).toBeTruthy();
  }
  const completion = await page.request.post("/api/counselling", { data: { action: "complete" } });
  expect(completion.ok()).toBeTruthy();

  await page.goto("/start/current-position");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/counselling\?first=stream_intent/);
  await page.getByText("Science", { exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Which subjects do you enjoy the most?" })).toBeVisible();
});
