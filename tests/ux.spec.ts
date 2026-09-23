import { test, expect, type Page } from "@playwright/test";

async function noOverflow(page: Page) {
  const dims = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, screen: window.innerWidth }));
  expect(dims.page, `Page is ${dims.page}px wide in a ${dims.screen}px viewport`).toBeLessThanOrEqual(dims.screen + 1);
}
async function createUser(page: Page) {
  const email = `cb-ux-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
  const response = await page.request.post('/api/auth/sign-up', { form: { fullName: 'UX Test Student', email, password: 'TestOnly-Strong-2026!', confirm: 'TestOnly-Strong-2026!' } });
  expect(response.ok()).toBeTruthy();
  const profile = await (await page.request.get('/api/profile')).json();
  expect(profile.signedIn).toBe(true);
}

test('landing uses screen width, public images, and recognisable actions', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your path is yours');
  const width = await page.locator('header > .cb-container').first().evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(1800);
  const left = await page.getByRole('heading', { level: 1 }).evaluate((el) => el.getBoundingClientRect().left);
  expect(left).toBeLessThan(100);
  const image = page.getByAltText('A student taking a thoughtful pause at her study desk');
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('main').getByRole('link', { name: 'Start exploring', exact: true })).toHaveCSS('font-weight', '650');
  expect((await page.request.get('/images/hero-student.png')).status()).toBe(200);
  await expect(page.getByText('Catalogue shown is a labelled sample dataset.')).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: 'artifacts/landing-desktop.png', fullPage: false });
});

test('animated guidance tiles can be selected and paused', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pause guidance animation' }).click();
  await expect(page.locator('.cb-guide')).toHaveAttribute('data-paused', 'true');
  await page.getByRole('button', { name: 'Budget', exact: true }).click();
  await expect(page.locator('.cb-guide p[aria-live]')).toContainText('fees and financial support');
});

test('counselling scrolls, preserves edits, and makes the next action clear', async ({ page }) => {
  await page.goto('/start');
  await page.getByText('Waiting for results', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page).toHaveURL(/\/counselling/);
  const values: Record<string, string> = { subjects_enjoy: 'mathematics', stream_intent: 'science', interests: 'technology', strengths: 'problem-solving', goals: 'technology', values: 'learning', location_pref: 'within-nagaland', budget: 'low' };
  let initialHeight = 0;
  for (let i = 0; i < 8; i++) {
    const state = await (await page.request.get('/api/counselling')).json();
    const q = state.question;
    expect(q).toBeTruthy();
    const option = q.options.find((o: { value: string }) => o.value === values[q.key]);
    await page.getByRole('button', { name: option.label, exact: true }).click();
    if (!initialHeight) initialHeight = (await page.locator('.cb-counselling-shell').boundingBox())!.height;
    const saved = page.waitForResponse((response) => response.url().endsWith('/api/counselling') && response.request().method() === 'POST');
    await page.getByRole('button', { name: i === 7 ? 'Finish & see my profile' : 'Continue', exact: true }).click();
    expect((await saved).ok()).toBeTruthy();
    if (i < 7) await expect(page.getByText(`${i + 1} of 8 answered`, { exact: true })).toBeVisible();
    if (i === 6) {
      const log = page.getByRole('log');
      const scroll = await log.evaluate((el) => ({ total: el.scrollHeight, height: el.clientHeight, overflow: getComputedStyle(el).overflowY }));
      expect(scroll.total).toBeGreaterThan(scroll.height);
      expect(scroll.overflow).toBe('auto');
      expect((await page.locator('.cb-counselling-shell').boundingBox())!.height).toBe(initialHeight);
    }
  }
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByRole('heading', { name: 'Pick a field to look into.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore this field', exact: true })).toHaveCount(3);
  await page.screenshot({ path: 'artifacts/profile-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Edit subjects you enjoy' }).click();
  await expect(page.getByRole('button', { name: 'Mathematics', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page).toHaveURL(/\/profile/);
  const state = await (await page.request.get('/api/profile')).json();
  expect(state.snapshot.subjectsEnjoy).toContain('english');
  await page.getByRole('link', { name: 'Explore this field', exact: true }).first().click();
  await expect(page).toHaveURL(/\/explore\//);
});

test('field and pathway details reveal one topic at a time', async ({ page }) => {
  await page.goto('/explore/technology');
  await expect(page.getByRole('tabpanel').filter({ visible: true })).toHaveCount(1);
  await page.getByRole('tab', { name: 'Careers', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Explore a kind of work' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The field, in a nutshell' })).not.toBeVisible();
  await page.getByRole('tab', { name: 'Is it for me?', exact: true }).click();
  await page.getByText('Why might this NOT be right for me?', { exact: true }).click();
  await expect(page.getByRole('tabpanel').filter({ visible: true })).toContainText('Tools change often');
  await page.goto('/explore/technology#pathways');
  await expect(page.getByRole('tab', { name: 'Study routes', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/pathways/class10-iti-trade');
  await expect(page.getByRole('heading', { name: 'Your route, one step at a time' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/pathway-desktop.png', fullPage: false });
  await noOverflow(page);
});

test('mentor launcher opens a bounded, scrollable chat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask CareerBridge Mentor' }).click();
  const dialog = page.getByRole('dialog', { name: 'CareerBridge Mentor', exact: true });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('textbox', { name: 'Your question for the mentor' });
  for (const question of ['What are my options after Class 10?', 'What if I want to stay in Nagaland?', 'What if I cannot afford college?']) {
    await input.fill(question);
    const reply = page.waitForResponse((response) => response.url().endsWith('/api/mentor') && response.request().method() === 'POST');
    await dialog.getByRole('button', { name: 'Send question' }).click();
    expect((await reply).ok()).toBeTruthy();
    await expect(input).toBeEnabled();
    await expect(dialog.getByRole('status')).toHaveCount(0);
  }
  const sizes = await dialog.getByRole('log').evaluate((el) => ({ total: el.scrollHeight, visible: el.clientHeight, overflow: getComputedStyle(el).overflowY }));
  expect(sizes.overflow).toBe('auto');
  expect(sizes.total).toBeGreaterThan(sizes.visible);
  await page.screenshot({ path: 'artifacts/mentor-corner.png', fullPage: false });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ask CareerBridge Mentor' })).toBeFocused();
});

test('source links are buttons, and filters and map remain functional', async ({ page }) => {
  await page.goto('/scholarships');
  const portal = page.getByRole('link', { name: /Visit official portal/ }).first();
  await expect(portal).toBeVisible();
  await expect(portal).toHaveAttribute('target', '_blank');
  await expect(portal).toHaveCSS('background-color', 'rgb(29, 99, 75)');
  await page.getByText('Who can apply?', { exact: true }).first().click();
  await noOverflow(page);
  await page.screenshot({ path: 'artifacts/scholarships-desktop.png', fullPage: false });
  await page.goto('/institutions');
  await page.getByText('More filters', { exact: false }).first().click();
  await page.getByLabel('District', { exact: true }).selectOption('Kohima');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page).toHaveURL(/district=Kohima/);
  const select = page.getByLabel('Choose a location');
  await expect(select).toBeVisible();
  const options = await select.locator('option').all();
  if (options.length > 1) await select.selectOption({ index: 1 });
  await expect(page.locator('figure').getByRole('link', { name: 'View institution', exact: true })).toBeVisible();
  await noOverflow(page);
});

test('compare controls align and show the chosen pair', async ({ page }) => {
  await page.goto('/compare?type=course');
  const a = page.getByLabel('Option 1', { exact: true });
  const b = page.getByLabel('Option 2', { exact: true });
  await a.selectOption('bca'); await b.selectOption('bsc-computer-science');
  const [boxA, boxB, boxButton] = await Promise.all([a.boundingBox(), b.boundingBox(), page.getByRole('button', { name: 'Compare', exact: true }).boundingBox()]);
  expect(Math.abs(boxA!.y - boxB!.y)).toBeLessThan(2);
  expect(Math.abs((boxA!.y + boxA!.height) - (boxButton!.y + boxButton!.height))).toBeLessThan(3);
  await page.getByRole('button', { name: 'Compare', exact: true }).click();
  await expect(page).toHaveURL(/a=bca/);
  await expect(page.getByRole('region', { name: 'Comparison', exact: true })).toBeVisible();
  await noOverflow(page);
});

test('saved state persists and sign-out requires confirmation', async ({ page }) => {
  await createUser(page);
  await page.goto('/courses/bca');
  const save = page.getByRole('button', { name: /^Save BCA/ });
  await expect(save).toBeEnabled(); await save.click();
  await expect(page.getByRole('button', { name: /^Unsave BCA/ })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: /^Unsave BCA/ })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/saved');
  await expect(page.getByRole('main')).toContainText('BCA');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Sign out for now?' });
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Stay here' }).click();
  await expect(confirm).not.toBeVisible();
  expect((await (await page.request.get('/api/profile')).json()).signedIn).toBe(true);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await confirm.getByRole('button', { name: 'Yes, sign out' }).click();
  await expect(page).toHaveURL('/');
  expect((await (await page.request.get('/api/profile')).json()).signedIn).toBe(false);
});

test('mobile layouts do not overflow and keep navigation accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/start', '/profile', '/explore/technology', '/courses/bca', '/pathways/class10-iti-trade', '/institutions', '/institutions/NL-NIT-002', '/scholarships', '/exams', '/compare?type=course&a=bca&b=bsc-computer-science', '/mentor']) {
    await page.goto(path); await expect(page.getByRole('main')).toBeVisible(); await noOverflow(page);
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile', exact: true }).getByRole('link', { name: /Scholarships/ }).click();
  await expect(page).toHaveURL('/scholarships');
  await expect(page.getByRole('navigation', { name: 'Mobile', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.screenshot({ path: 'artifacts/landing-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('counselling rejects invalid closed-option answers', async ({ request }) => {
  const response = await request.post('/api/counselling', { data: { stage: 'class10', questionKey: 'budget', values: ['fabricated-category'] } });
  expect(response.status()).toBe(400);
  const uncertain = await request.post('/api/counselling', { data: { stage: 'class10', questionKey: 'budget', values: ['not-sure'] } });
  expect(uncertain.ok()).toBe(true);
});
