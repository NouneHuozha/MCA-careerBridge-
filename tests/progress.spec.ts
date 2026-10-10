import { test, expect } from '@playwright/test';
const answers: [string, string[]][] = [
  ['subjects_enjoy', ['mathematics']], ['stream_intent', ['science']], ['interests', ['technology']],
  ['strengths', ['problem-solving']], ['work_style', ['mixed']], ['goals', ['technology']], ['values', ['learning']],
  ['location_pref', ['within-nagaland']], ['budget', ['low']],
];
test('completed counselling follows complete, review, confirmation, and possibilities', async ({ page }) => {
  for (const [questionKey, values] of answers) {
    const response = await page.request.post('/api/counselling', { data: { action: 'answer', stage: 'class10', questionKey, values } });
    expect(response.ok()).toBe(true);
  }
  const completion = await page.request.post('/api/counselling', { data: { action: 'complete' } });
  expect(completion.ok()).toBe(true);

  await page.goto('/counselling');
  await expect(page).toHaveURL(/\/guidance\/complete$/);
  await expect(page.getByRole('heading', { name: 'We’ve finished getting to know you' })).toBeVisible();
  await page.getByRole('link', { name: 'Review what we understood' }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  await expect(page.getByRole('heading', { name: 'Here’s what we understood' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="review-heading"]').getByText('Step 5 of 5')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Where you are now' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What you enjoy and bring' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What matters to you' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Still open' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit Where you are now' })).toHaveAttribute('href', '/guidance/review?mode=correct');
  await page.getByRole('link', { name: 'This starting picture feels right — continue' }).click();
  await expect(page).toHaveURL(/\/guidance\/confirm$/);
  await expect(page.getByRole('heading', { name: 'Your starting picture is confirmed' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore possible directions' }).click();
  await expect(page).toHaveURL(/\/guidance\/possibilities$/);
  await expect(page.getByRole('heading', { name: 'Here are a few directions to explore' })).toBeVisible();
  await expect(page.getByText('The order is not a ranking')).toBeVisible();
  await expect(page.getByText('Why it may connect', { exact: true }).first()).toBeVisible();
  await page.goto('/guidance');
  await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Continue where you left off' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your explorations' })).toBeVisible();
});

test('image 15 review accepts not-sure, allows adding optional detail, and returns to review', async ({ page }) => {
  const reviewAnswers: [string, string[]][] = [
    ['stream_intent', ['science']], ['subjects_enjoy', ['not-sure']], ['interests', ['not-sure']],
    ['strengths', ['problem-solving', 'communication', 'creativity']], ['work_style', ['mixed']],
    ['goals', ['stable', 'helping', 'creative']], ['values', ['stability', 'work-life-balance']],
    ['location_pref', ['within-nagaland']], ['budget', ['prefer-not']],
  ];
  for (const [questionKey, values] of reviewAnswers) {
    const response = await page.request.post('/api/counselling', { data: { action: 'answer', stage: 'class10', questionKey, values } });
    expect(response.ok()).toBe(true);
  }
  expect((await page.request.post('/api/counselling', { data: { action: 'complete' } })).ok()).toBe(true);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/guidance/review');
  await expect(page.getByRole('heading', { name: 'Here’s what we understood' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'CareerBridge home' })).toHaveCount(1);
  await expect(page.locator('section[aria-labelledby="review-heading"]').getByText('Step 5 of 5')).toBeVisible();
  await expect(page.getByText('Not sure yet', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Problem solving, Communication, Creativity', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add more detail' })).toBeVisible();

  await page.getByRole('link', { name: 'Edit What you enjoy and bring' }).click();
  await expect(page).toHaveURL(/\/guidance\/review\?mode=correct$/);
  await expect(page.getByRole('heading', { name: 'Change what we understood' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Here’s what we understood' })).toBeVisible();

  await page.getByRole('link', { name: 'Add more detail' }).click();
  await expect(page).toHaveURL(/\/counselling\?edit=anything_else/);
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  await page.getByRole('link', { name: 'Add more detail' }).click();
  await expect(page).toHaveURL(/\/counselling\?edit=anything_else/);
  await page.getByRole('textbox', { name: 'Your answer' }).fill('I enjoy building small science projects.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL(/\/guidance\/review$/);
  await expect(page.getByText('Extra detail you shared: I enjoy building small science projects.')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(390);
  await page.getByRole('link', { name: 'This starting picture feels right — continue' }).click();
  await expect(page).toHaveURL(/\/guidance\/confirm$/);
});
test('mobile counselling keeps progress and composer visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [questionKey, values] of answers.slice(0, 3)) {
    expect((await page.request.post('/api/counselling', { data: { stage: 'class10', questionKey, values } })).ok()).toBe(true);
  }
  await page.goto('/counselling');
  await expect(page.getByText('3 of 8 answered', { exact: true })).toBeVisible();
  const panel = page.locator('.cb-counselling-shell');
  const initial = (await panel.boundingBox())!.height;
  const log = page.getByRole('log');
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await page.getByRole('button', { name: 'Problem solving', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('4 of 8 answered', { exact: true })).toBeVisible();
  expect((await panel.boundingBox())!.height).toBe(initial);
  await expect(page.getByRole('button', { name: 'Ask CareerBridge Mentor' })).toHaveCount(0);
  await page.screenshot({ path: 'artifacts/counselling-mobile.png', fullPage: true });
});

test('account keeps the journey but sign-out hides it on a shared device', async ({ page }) => {
  for (const [questionKey, values] of answers.slice(0, 3)) {
    expect((await page.request.post('/api/counselling', { data: { stage: 'class10', questionKey, values } })).ok()).toBe(true);
  }
  const email = `cb-ux-private-${Date.now()}@example.test`;
  const password = 'TestOnly-Strong-2026!';
  expect((await page.request.post('/api/auth/sign-up', { form: { fullName: 'Privacy UX Test', email, password, confirm: password, next: '/profile' } })).ok()).toBe(true);
  let data = await (await page.request.get('/api/profile')).json();
  expect(data.signedIn).toBe(true); expect(data.snapshot.interests).toContain('technology');
  await page.request.post('/api/auth/sign-out');
  data = await (await page.request.get('/api/profile')).json();
  expect(data.signedIn).toBe(false); expect(data.started).toBe(false);
  const response = await page.request.post('/api/auth/sign-in', { form: { email, password, next: '/courses/bca' } });
  expect(new URL(response.url()).pathname).toBe('/courses/bca');
  data = await (await page.request.get('/api/profile')).json();
  expect(data.signedIn).toBe(true); expect(data.snapshot.interests).toContain('technology');
});

test('action checklist persists checked tasks', async ({ page }) => {
  for (const [questionKey, values] of answers) {
    expect((await page.request.post('/api/counselling', { data: { action: 'answer', stage: 'class10', questionKey, values } })).ok()).toBe(true);
  }
  expect((await page.request.post('/api/counselling', { data: { action: 'complete' } })).ok()).toBe(true);
  const email = `cb-ux-plan-${Date.now()}@example.test`;
  const password = 'TestOnly-Strong-2026!';
  expect((await page.request.post('/api/auth/sign-up', { form: { fullName: 'Plan UX Test', email, password, confirm: password } })).ok()).toBe(true);
  await page.goto('/guidance/action-plan?focus=course:bca');
  await page.getByRole('button', { name: 'Complete Check eligibility', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Uncheck Check eligibility', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Uncheck Check eligibility', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const data = await (await page.request.get('/api/action-plan')).json();
  expect(data.plans[0].items[0].status).toBe('done');
});
