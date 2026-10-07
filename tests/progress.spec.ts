import { test, expect } from '@playwright/test';
const answers: [string, string[]][] = [
  ['subjects_enjoy', ['mathematics']], ['stream_intent', ['science']], ['interests', ['technology']],
  ['strengths', ['problem-solving']], ['goals', ['technology']], ['values', ['learning']],
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
  await page.getByRole('link', { name: 'This looks right — continue' }).click();
  await expect(page).toHaveURL(/\/guidance\/confirm$/);
  await expect(page.getByRole('heading', { name: 'Your starting picture is confirmed' })).toBeVisible();
  await page.getByRole('link', { name: 'Explore possible directions' }).click();
  await expect(page).toHaveURL(/\/guidance\/possibilities$/);
  await expect(page.getByRole('heading', { name: 'Here are a few directions to explore' })).toBeVisible();
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
