import { expect, test } from "@playwright/test";

const answers: [string, string[]][] = [
  ["stream_intent", ["science"]],
  ["subjects_enjoy", ["mathematics"]],
  ["interests", ["engineering", "technology"]],
  ["strengths", ["problem-solving"]],
  ["work_style", ["mixed"]],
  ["goals", ["technology"]],
  ["values", ["learning"]],
  ["location_pref", ["within-nagaland"]],
  ["budget", ["low"]],
];

test("post-counselling review stays editable and responsive", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/start");
  const successfulAnswers = await page.evaluate(async (answersToSubmit) => {
    const results = [];
    for (const [questionKey, values] of answersToSubmit) {
      const response = await fetch("/api/counselling", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "answer", stage: "class10", questionKey, values }),
      });
      results.push(response.ok);
    }
    return results;
  }, answers);
  expect(successfulAnswers.every(Boolean)).toBe(true);

  await page.goto("/guidance/review");
  await expect(page.getByRole("heading", { name: "Check your starting picture" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Some of the things you shared" })).toBeVisible();
  await expect(page.getByText("What we heard", { exact: true })).toBeVisible();
  const profileTabs = page.getByRole("tablist", { name: "Profile sections" });
  await expect(profileTabs).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where you are now" })).toBeVisible();
  await expect(page.getByText(/Problem solving and Engineering and building things stand out/)).toBeVisible();
  await expect(profileTabs.getByRole("tab", { name: /My foundation/ })).toHaveAttribute("aria-selected", "true");

  await expect(page.getByRole("link", { name: "Change study stage" })).toHaveAttribute("href", "/guidance/review?mode=correct#edit-where");

  await profileTabs.getByRole("tab", { name: /What I enjoy/ }).click();
  await expect(page.getByRole("heading", { name: "What you enjoy and bring" })).toBeVisible();
  await expect(page.getByText("Mathematics", { exact: true })).toBeVisible();
  const interestsDestinations: [string, string][] = [
    ["Change interests", "edit-enjoy"],
    ["Change strengths", "edit-bring"],
    ["Change work style", "edit-bring"],
  ];
  for (const [name, section] of interestsDestinations) {
    await expect(page.getByRole("link", { name })).toHaveAttribute("href", `/guidance/review?mode=correct#${section}`);
  }

  await profileTabs.getByRole("tab", { name: /What matters/ }).click();
  await expect(page.getByRole("heading", { name: "What matters to you" })).toBeVisible();
  const prioritiesDestinations: [string, string][] = [
    ["Change goals", "edit-matters"],
    ["Change study location", "edit-practical"],
    ["Change cost preference", "edit-practical"],
  ];
  for (const [name, section] of prioritiesDestinations) {
    await expect(page.getByRole("link", { name })).toHaveAttribute("href", `/guidance/review?mode=correct#${section}`);
  }

  await profileTabs.getByRole("tab", { name: /More to share/ }).click();
  await expect(page.locator(".cb-review-extra")).toBeVisible();
  await expect(page.getByRole("link", { name: "Add more detail" })).toHaveAttribute("href", "/guidance/review/details");
  await expect(page.getByRole("link", { name: "Continue without adding" })).toHaveAttribute("href", "/guidance/confirm");
  await expect(page.getByRole("link", { name: "Continue to confirmation" })).toHaveAttribute("href", "/guidance/confirm");

  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow, `horizontal overflow at ${width}px`).toBe(false);
  }

  await page.getByRole("link", { name: "Continue to confirmation" }).click();
  await expect(page).toHaveURL(/\/guidance\/confirm$/);
  await expect(page.getByRole("heading", { name: "Your starting picture is ready" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explore possible directions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What we will keep in mind" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore possible directions" })).toHaveAttribute("href", "/guidance/possibilities");

  const confirmationHeight = await page.locator(".cb-confirm-layout").evaluate((element) => element.getBoundingClientRect().height);
  expect(confirmationHeight).toBeLessThan(650);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow, `confirmation overflow at ${width}px`).toBe(false);
  }
});
