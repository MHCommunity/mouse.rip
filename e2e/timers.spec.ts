import { expect, test, timers } from './fixtures';

test('timers come back by themselves after a failed first load', async ({ page, consoleErrors }) => {
  let calls = 0;
  await page.route('https://api.mouse.rip/timers', (route) =>
    calls++ === 0 ? route.fulfill({ status: 503, body: 'down' }) : route.fulfill({ json: timers() }),
  );
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByText('Location timers are unavailable right now.')).toBeVisible();
  // The clock ticks every 30 seconds, and a tick with nothing loaded tries again.
  await page.clock.fastForward(31_000);
  await expect(page.getByText('Forbidden Grove')).toBeVisible();
  // The browser logs the 503 itself.
  consoleErrors.splice(0);
});

test('a timers response that has changed shape counts as unavailable, not a crash', async ({ page }) => {
  await page.route('https://api.mouse.rip/timers', (route) => route.fulfill({ json: { locations: 'soon' } }));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByText('Location timers are unavailable right now.')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
