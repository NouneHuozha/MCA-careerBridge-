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

async function openEditor(page: import("@playwright/test").Page) {
  await page.getByRole("link", { name: "Edit interests" }).click();
  await expect(page.getByRole("heading", { name: "Change what we understood" })).toBeVisible();
}

test("the edit page presents the current counselling flow as one accessible editor", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await openEditor(page);
  for (const heading of ["Where you are now", "What you enjoy", "What you bring", "What matters to you", "Practical considerations"]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Which subjects do you enjoy?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What kinds of things genuinely interest you?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What are you good at?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save and return later" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save this change" })).toHaveCount(0);
  await page.goto("/guidance/review?mode=correct&section=interests");
  await expect(page.getByRole("heading", { name: "Change what we understood" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
});

test("grouped subjects and interests, custom text, and optional reflection save together", async ({ page }) => {
  await finishCounsellingAtReview(page);
  const beforeEdit = await (await page.request.get("/api/counselling")).json();
  const textSeed = await page.request.post("/api/profile/correction", { data: { stage: beforeEdit.stage, stageDetail: beforeEdit.stageDetail, answers: { interests: { values: ["engineering", "technology"], text: "Previously saved interest detail" } } } });
  expect(textSeed.ok()).toBeTruthy();

  await openEditor(page);
  const subjects = page.locator("#edit-enjoy");
  await subjects.getByRole("button", { name: /Science and mathematics.*1 selected/ }).click();
  await subjects.getByRole("checkbox", { name: "Physics" }).check();

  const interests = page.locator('section[aria-labelledby="interests-title"]');
  await interests.getByRole("button", { name: /Health, science, and nature.*0 selected/ }).click();
  await interests.getByRole("checkbox", { name: "Medicine and health" }).check();
  await interests.getByRole("checkbox", { name: "Something else" }).check();
  await interests.getByLabel(/Add a little detail/).fill("Repairing old radios");
  await subjects.getByRole("textbox", { name: /Something you enjoyed doing recently/ }).fill("I like making small science projects.");

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.subjects_enjoy.values).toEqual(["mathematics", "physics"]);
  expect(saved.answers.interests.values).toEqual(["engineering", "technology", "medicine", "other"]);
  expect(saved.answers.interests.text).toBe("Repairing old radios");
  expect(saved.answers.interest_story.text).toBe("I like making small science projects.");
  expect(saved.answers.strengths.values).toEqual(["problem-solving"]);
  await expect(page.getByText("Something else: Repairing old radios")).toBeVisible();
});

test("class and stage-specific stream can be corrected without losing other answers", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await openEditor(page);
  await page.getByRole("radio", { name: "Class 12" }).check();
  await page.getByRole("radio", { name: "Class completed / results available" }).check();
  await page.getByRole("radio", { name: "Science with Mathematics" }).check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);

  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.stage).toBe("class12");
  expect(saved.stageDetail).toBe("completed");
  expect(saved.answers.stream_current.values).toEqual(["science-pcm"]);
  expect(saved.answers.subjects_enjoy.values).toEqual(["mathematics"]);
  expect(saved.answers.interests.values).toEqual(["engineering", "technology"]);
});

test("offline and failed saves retain the draft and allow retry", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await openEditor(page);
  const interests = page.locator("#edit-enjoy");
  await interests.getByRole("button", { name: /Health, science, and nature.*0 selected/ }).click();
  await interests.getByRole("checkbox", { name: "Medicine and health" }).check();

  await page.context().setOffline(true);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator('main p[role="alert"]')).toContainText("You’re offline");
  await expect(interests.getByRole("checkbox", { name: "Medicine and health" })).toBeChecked();
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
  await expect(interests.getByRole("checkbox", { name: "Medicine and health" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  const unchanged = await (await page.request.get("/api/counselling")).json();
  expect(unchanged.answers.interests.values).toEqual(["engineering", "technology"]);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  expect(attempts).toBe(2);
});

test("Save and return later commits changes, while Cancel discards local drafts", async ({ page }) => {
  await finishCounsellingAtReview(page);
  await openEditor(page);
  const interests = page.locator("#edit-enjoy");
  await interests.getByRole("button", { name: /Health, science, and nature.*0 selected/ }).click();
  await interests.getByRole("checkbox", { name: "Medicine and health" }).check();
  await page.getByRole("button", { name: "Save and return later" }).click();
  await expect(page).toHaveURL(/\/start\?counsellingSaved=1$/);
  await expect(page.getByRole("status")).toContainText("Your counselling progress has been saved");
  const saved = await (await page.request.get("/api/counselling")).json();
  expect(saved.answers.interests.values).toEqual(["engineering", "technology", "medicine"]);

  await page.goto("/guidance/review");
  await openEditor(page);
  await page.locator("#edit-enjoy").getByRole("checkbox", { name: "I’m not sure yet" }).nth(1).check();
  await expect(page.getByText("That’s okay. You can explore possibilities before deciding.")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  const afterCancel = await (await page.request.get("/api/counselling")).json();
  expect(afterCancel.answers.interests.values).toEqual(["engineering", "technology", "medicine"]);
});
