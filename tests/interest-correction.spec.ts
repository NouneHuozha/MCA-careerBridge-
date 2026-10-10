import { expect, test } from "@playwright/test";

async function finishCounsellingAtReview(page: import("@playwright/test").Page) {
  await page.goto("/start");
  await page.getByRole("link", { name: "Start counselling" }).click();
  await page.getByRole("radio", { name: "I’m currently in Class 10" }).check();
  await page.getByRole("radio", { name: "I’m waiting for results" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("radio", { name: "Science" }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  const answers: Record<string, string[]> = {
    subjects_enjoy: ["mathematics"],
    interests: ["engineering", "technology"],
    strengths: ["problem-solving"],
    work_style: ["mixed"],
    goals: ["technology"],
    values: ["learning"],
    location_pref: ["within-nagaland"],
    budget: ["low"],
  };
  for (const [questionKey, values] of Object.entries(answers)) {
    const response = await page.request.post("/api/counselling", { data: { questionKey, values, text: null } });
    expect(response.ok(), `answer ${questionKey}`).toBeTruthy();
  }
  const completed = await page.request.post("/api/counselling", { data: { action: "complete" } });
  expect(completed.ok()).toBeTruthy();
  await page.goto("/guidance/review");
}

test("focused interest correction follows the reference, saves canonical values and returns to summary", async ({ page }) => {
  await finishCounsellingAtReview(page);
  const beforeEdit = await (await page.request.get("/api/counselling")).json();
  const textSeed = await page.request.post("/api/profile/correction", { data: { stage: beforeEdit.stage, stageDetail: beforeEdit.stageDetail, answers: { interests: { values: ["engineering", "technology"], text: "Previously saved interest detail" } } } });
  expect(textSeed.ok()).toBeTruthy();
  const valuesOnlyEdit = await page.request.post("/api/profile/correction", { data: { stage: beforeEdit.stage, stageDetail: beforeEdit.stageDetail, answers: { interests: ["engineering", "technology"] } } });
  expect(valuesOnlyEdit.ok()).toBeTruthy();
  const preservedText = await (await page.request.get("/api/counselling")).json();
  expect(preservedText.answers.interests.text).toBe("Previously saved interest detail");

  await page.getByRole("link", { name: "Edit interests" }).click();
  await expect(page.getByRole("heading", { name: "Change anything that no longer feels right." })).toBeVisible();
  await expect(page.getByRole("note")).toContainText("You’re editing: What interests you");
  await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);

  const making = page.getByRole("button", { name: /Technology, engineering, and making.*2 selected/ });
  await expect(making).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("checkbox", { name: "Engineering and building things" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Technology and computers" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Something else" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "I’m not sure yet" })).toBeVisible();

  await page.getByRole("button", { name: "Health, science, and nature 0 selected" }).click();
  await page.getByRole("checkbox", { name: "Medicine and health" }).check();
  await page.getByRole("button", { name: /Technology, engineering, and making.*2 selected/ }).click();
  await page.getByRole("button", { name: /Technology, engineering, and making.*2 selected/ }).click();
  await expect(page.getByRole("checkbox", { name: "Engineering and building things" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Technology and computers" })).toBeChecked();
  await page.getByRole("checkbox", { name: "Something else" }).check();
  await page.getByLabel(/Tell us more, if you’d like/).fill("Repairing old radios");

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.interests.values).toEqual(["engineering", "technology", "medicine", "other"]);
  expect(saved.answers.interests.text).toBe("Repairing old radios");
  expect(saved.answers.subjects_enjoy.values).toEqual(["mathematics"]);
  await expect(page.getByText("Medicine and health")).toBeVisible();
  await expect(page.getByText("Something else: Repairing old radios")).toBeVisible();
});

test("offline or failed saves keep the draft and can be retried", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await page.getByRole("link", { name: "Edit interests" }).click();
  await page.getByRole("button", { name: /Health, science, and nature.*0 selected/ }).click();
  await page.getByRole("checkbox", { name: "Medicine and health" }).check();

  await page.context().setOffline(true);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator('main p[role="alert"]')).toContainText("You’re offline");
  await expect(page.getByRole("checkbox", { name: "Medicine and health" })).toBeChecked();
  await page.context().setOffline(false);

  let attempts = 0;
  await page.route("**/api/profile/correction", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "We couldn't save those changes just now. Your earlier answers are safe—please try again." }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }
  });

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator('main p[role="alert"]')).toContainText("Your earlier answers are safe");
  await expect(page.getByRole("checkbox", { name: "Medicine and health" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  const unchanged = await (await page.request.get("/api/counselling")).json();
  expect(unchanged.answers.interests.values).toEqual(["engineering", "technology"]);

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  expect(attempts).toBe(2);
});

test("Save and return later saves the edit and confirms progress", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await page.getByRole("link", { name: "Edit interests" }).click();
  await page.getByRole("button", { name: /Health, science, and nature.*0 selected/ }).click();
  await page.getByRole("checkbox", { name: "Medicine and health" }).check();
  await page.getByRole("button", { name: "Save and return later" }).click();

  await expect(page).toHaveURL(/\/start\?counsellingSaved=1$/);
  await expect(page.getByRole("status")).toContainText("Your counselling progress has been saved");
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.interests.values).toEqual(["engineering", "technology", "medicine"]);
});

test("Not sure is accepted; cancel returns to the summary without saving draft edits", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await page.getByRole("link", { name: "Edit interests" }).click();
  await page.getByRole("checkbox", { name: "I’m not sure yet" }).check();
  await expect(page.getByRole("status").filter({ hasText: "That’s okay. You can explore possibilities before deciding." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "I’m not sure yet" })).not.toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Engineering and building things" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Technology and computers" })).toBeChecked();
  await page.getByRole("checkbox", { name: "I’m not sure yet" }).check();
  await page.getByRole("link", { name: "Cancel and return to summary" }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.interests.values).toEqual(["engineering", "technology"]);
});
