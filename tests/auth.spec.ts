import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("homepage account link points guests to sign in and signup", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const desktopLink = page.getByRole("link", { name: "Sign in / Sign up", exact: true });
  await expect(desktopLink).toBeVisible();
  await expect(desktopLink).toHaveAttribute("href", "/sign-in");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileLink = page.locator("#home-mobile-nav").getByRole("link", { name: "Sign in / Sign up", exact: true });
  await expect(mobileLink).toBeVisible();
  await expect(mobileLink).toHaveAttribute("href", "/sign-in");
});

test("sign-in and sign-up password visibility controls work", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: "Ask CareerBridge Mentor" })).toHaveCount(0);
  const signInPassword = page.locator("#sign-in-password");
  await signInPassword.fill("test-password");
  const signInToggle = page.getByRole("button", { name: "Show password" });
  await expect(signInToggle).toHaveText("");
  await expect(signInToggle).toHaveAttribute("title", "Show password");
  await signInToggle.click();
  await expect(signInPassword).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(signInPassword).toHaveAttribute("type", "password");
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");

  await page.goto("/sign-up");
  await expect(page.getByRole("button", { name: "Ask CareerBridge Mentor" })).toHaveCount(0);
  const signUpPassword = page.locator("#sign-up-password");
  await signUpPassword.fill("test-password");
  const signUpToggle = page.getByRole("button", { name: "Show password" });
  await expect(signUpToggle).toHaveText("");
  await signUpToggle.click();
  await expect(signUpPassword).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Show confirmation password" })).toBeVisible();
});

test("auth pages keep a minimal header and slide a shared green panel between forms", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/sign-up");
  await expect(page.getByRole("link", { name: "CareerBridge home" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Page navigation" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveCount(0);
  await expect(page.getByText("You can browse first and change your answers later.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("We never need your exact address.", { exact: true })).toHaveCount(0);

  const slider = page.locator("[data-auth-slider]");
  await expect(slider.getByRole("heading", { name: "Welcome to CareerBridge." })).toBeVisible();
  await expect(slider.locator("h2")).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(slider.locator("h2")).toHaveCSS("font-size", "40px");
  await expect(slider.locator("h2")).toHaveCSS("font-weight", "800");
  await expect(slider.locator("p")).toHaveCSS("margin-top", "24px");
  await expect(slider).toHaveCSS("border-top-right-radius", "40px");
  await expect(slider).toHaveCSS("transition-property", /transform/);
  await expect(slider).toHaveCSS("transition-duration", "0.7s");
  const signUpPosition = await slider.boundingBox();
  if (!signUpPosition) throw new Error("Auth switch panel is not visible at desktop width.");
  const card = page.locator("[data-auth-card]");
  const signUpCard = await card.boundingBox();
  if (!signUpCard) throw new Error("Auth card is not visible at desktop width.");

  await slider.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.locator('[data-auth-panel="sign-in"]')).toBeVisible();
  await expect(page.locator('[data-auth-panel="sign-up"]')).toHaveAttribute("aria-hidden", "true");
  await expect(slider.getByRole("heading", { name: "Welcome to CareerBridge." })).toBeVisible();
  await page.waitForTimeout(120);
  const movingPosition = await slider.boundingBox();
  expect(movingPosition!.x).toBeGreaterThan(signUpPosition.x + 20);
  expect(movingPosition!.x).toBeLessThan(signUpPosition.x + signUpPosition.width - 20);
  await expect(slider).toHaveCSS("border-top-right-radius", "40px");
  await expect.poll(async () => (await slider.boundingBox())?.x ?? 0).toBeGreaterThan(signUpPosition.x + 100);
  const signInPosition = await slider.boundingBox();
  expect(signInPosition?.width).toBeCloseTo(signUpPosition.width, 1);
  const signInCard = await card.boundingBox();
  expect(signInCard?.width).toBe(signUpCard.width);
  expect(signInCard?.height).toBe(signUpCard.height);
  await page.goBack();
  await expect(page).toHaveURL(/\/sign-up/);
  await expect.poll(async () => (await slider.boundingBox())?.x ?? 0).toBeLessThan((signInPosition?.x ?? 0) - 100);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileCard = await card.boundingBox();
  if (!mobileCard) throw new Error("Auth card is not visible at mobile width.");
  await slider.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(slider).toBeVisible();
  await expect(slider.locator("img")).toHaveCount(0);
  const mobilePanel = await slider.boundingBox();
  const createAccountButton = await slider.getByRole("button", { name: "Create account" }).boundingBox();
  if (!mobilePanel || !createAccountButton) throw new Error("Mobile auth switch content is not visible.");
  expect(createAccountButton.y + createAccountButton.height).toBeLessThan(mobilePanel.y + mobilePanel.height - 24);
  const mobileSignInCard = await card.boundingBox();
  expect(mobileSignInCard?.width).toBe(mobileCard.width);
  expect(mobileSignInCard?.height).toBe(mobileCard.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("password recovery clearly reports when email delivery is not configured", async ({ page }) => {
  await page.goto("/forgot-password");
  const resetConfigured = Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM && process.env.APP_URL);
  if (resetConfigured) {
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  } else {
    await expect(page.getByText("Password reset isn’t configured yet", { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "/sign-in");
});

test("account details require a signed-in user", async ({ page }) => {
  await page.goto("/guidance/account");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fguidance%2Faccount/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
});

test("Google sign-in explains when provider setup is missing", async ({ page }) => {
  const configured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.APP_URL);
  await page.goto("/sign-in");
  if (configured) {
    await expect(page.locator('[data-auth-panel="sign-in"]').getByRole("link", { name: "Continue with Google" })).toBeVisible();
  } else {
    const signInPanel = page.locator('[data-auth-panel="sign-in"]');
    await expect(signInPanel.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    await expect(signInPanel.getByText("Google sign-in will be available after provider setup.")).toBeVisible();
  }
});

test("account can log out, sign back in, and delete itself with typed confirmation", async ({ page }) => {
  const email = `account-removal-${randomUUID()}@example.test`;
  const password = "careerbridge-test-password";

  await page.goto("/sign-up");
  await page.locator("#sign-up-name").fill("Account Removal Test");
  await page.locator("#sign-up-email").fill(email);
  await page.locator("#sign-up-password").fill(password);
  await page.locator("#sign-up-confirm").fill(password);
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page).toHaveURL(/\/guidance/);

  await page.goto("/guidance/account");
  await expect(page.getByText("Set · hidden for security")).toBeVisible();
  const deleteDialog = page.getByRole("dialog", { name: "Delete your account?" });
  await expect(deleteDialog).not.toBeVisible();
  await page.getByRole("button", { name: "Delete account", exact: true }).click();
  await expect(deleteDialog).toBeVisible();
  await expect(deleteDialog.getByText("This permanently deletes your account, counselling progress, profile, saved items, and associated conversations. This cannot be undone.")).toBeVisible();
  await deleteDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(deleteDialog).not.toBeVisible();
  await page.getByRole("button", { name: "Delete account", exact: true }).click();
  await deleteDialog.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  const logoutDialog = page.getByRole("dialog", { name: "Log out of CareerBridge?" });
  await expect(logoutDialog).toBeVisible();
  await expect(logoutDialog.getByText("Your saved account progress will still be available when you sign back in.")).toBeVisible();
  await logoutDialog.getByRole("button", { name: "Stay signed in" }).click();
  await expect(logoutDialog).not.toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByRole("dialog", { name: "Log out of CareerBridge?" }).getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/sign-in");
  await page.locator("#sign-in-email").fill(email);
  await page.locator("#sign-in-password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: false }).first().click();
  await expect(page).toHaveURL(/\/guidance/);
  await page.goto("/guidance/account");

  const confirmation = page.locator("#delete-confirmation");
  await confirmation.fill("delete");
  expect(await confirmation.evaluate((input: HTMLInputElement) => input.validity.patternMismatch)).toBe(true);
  await expect(confirmation).toHaveAttribute("aria-invalid", "true");
  await confirmation.fill("DELETE");
  await page.getByRole("button", { name: "Permanently delete account" }).click();
  await expect(page).toHaveURL(/\/sign-in\?deleted=1/);
  await expect(page.getByText("Your account and its personal data have been deleted.")).toBeVisible();
});
