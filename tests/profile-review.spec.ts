import { test, expect, type Page } from "@playwright/test";

async function noOverflow(page: Page) {
  const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.page, `Page is ${widths.page}px wide in a ${widths.viewport}px viewport`).toBeLessThanOrEqual(widths.viewport + 1);
}

async function saveAnswersInBrowser(page: Page, answers: [string, string[]][]) {
  const result = await page.evaluate(async (payload) => {
    for (const [questionKey, values] of payload) {
      const response = await fetch("/api/counselling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", questionKey, values }),
      });
      const body = await response.json();
      if (!response.ok) return { ok: false, status: response.status, questionKey, body };
    }
    const response = await fetch("/api/counselling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    return { ok: response.ok, status: response.status, body: await response.json() };
  }, answers);
  expect(result.ok, `Counselling setup failed: ${JSON.stringify(result)}`).toBeTruthy();
}

test("Profile Review uses saved answers and edits return to the same page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/start");
  await page.getByText("I’m finishing or have completed Class 12").click();
  await page.getByText("I’m still studying", { exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/counselling$/);

  const answers: [string, string[]][] = [
    ["subjects_enjoy", ["mathematics"]], ["stream_current", ["science-pcm"]],
    ["interests", ["technology"]], ["strengths", ["problem-solving"]],
    ["goals", ["technology"]], ["values", ["learning"]],
    ["location_pref", ["within-nagaland"]], ["budget", ["low"]],
  ];
  await saveAnswersInBrowser(page, answers);

  await page.goto("/reflection");
  await expect(page.getByRole("heading", { name: "Here’s what we understood" })).toBeVisible();
  await expect(page.getByText("Subjects you enjoy: Mathematics")).toBeVisible();
  await expect(page.getByText(/Interests: Technology & computers/)).toBeVisible();
  await expect(page.getByText("Career priorities: Continuous learning")).toBeVisible();
  await expect(page.getByText("Example student scenario")).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: "/tmp/profile-review-desktop.png", fullPage: true });

  await page.getByRole("link", { name: "Edit What you enjoy and feel comfortable with" }).click();
  await expect(page.getByRole("heading", { name: "What kinds of things genuinely interest you?" })).toBeVisible();
  await page.getByRole("button", { name: /Art, design & making things/ }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page).toHaveURL(/\/reflection/);
  await expect(page.getByText(/Interests: .*Art, design & making things/)).toBeVisible();

  await page.getByRole("link", { name: "Edit Where you are now" }).click();
  await expect(page).toHaveURL(/\/start\?edit=profile/);
  await expect(page.getByRole("heading", { name: "Update your starting point." })).toBeVisible();
  await expect(page.locator('input[name="stage"][value="class12"]')).toBeChecked();
  await page.getByText("I’m finishing or have completed Class 10").click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page).toHaveURL(/\/counselling$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/stream/i);
  await page.getByRole("button", { name: /^Science/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/counselling\/complete/);
  await page.getByRole("link", { name: "Review what we understood" }).click();
  await expect(page).toHaveURL(/\/reflection/);
  await expect(page.getByText("Class 10", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "This looks right — continue" }).click();
  await expect(page.getByRole("status")).toContainText("Your answers remain editable");
  await expect(page).toHaveURL(/\/reflection/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await noOverflow(page);
  await page.screenshot({ path: "/tmp/profile-review-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("link", { name: "Profile", exact: true }).last()).toBeVisible();
});
