import { test, expect } from '@playwright/test';

test('legacy post-counselling URLs permanently redirect to guidance destinations', async ({ request }) => {
  const cases: [string, string][] = [
    ['/reflection', '/guidance/review'],
    ['/profile', '/guidance/review'],
    ['/my-direction', '/guidance/possibilities'],
    ['/my-journey', '/guidance'],
    ['/my-journey/direction', '/guidance/possibilities'],
    ['/my-journey/direction/technology', '/guidance/direction/technology'],
    ['/my-journey/direction/technology/confirm', '/guidance/direction/technology'],
    ['/my-journey/direction/technology/routes', '/guidance/direction/technology/routes'],
    ['/my-journey/courses/compare', '/guidance/compare'],
    ['/my-journey/courses', '/guidance/possibilities'],
    ['/my-journey/institutions', '/guidance/possibilities'],
    ['/my-journey/plan', '/guidance/action-plan'],
    ['/my-journey/practical', '/guidance/action-plan'],
    ['/dashboard', '/guidance'],
    ['/action-plan?focus=course%3Abca', '/guidance/action-plan'],
    ['/saved?type=course', '/guidance/saved'],
  ];

  for (const [oldPath, destination] of cases) {
    const response = await request.get(oldPath, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers().location).toContain(destination);
  }
});

test('pre-counselling and general exploration routes are not redirected to guidance', async ({ request }) => {
  for (const path of ['/start', '/explore', '/courses', '/pathways', '/institutions']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([301, 308]).not.toContain(response.status());
  }
});
