import { expect, relicHunter, test } from './fixtures';

test('names where she is, links to it, and says how fresh that is', async ({ page }) => {
  await page.goto('/relic-hunter');
  const card = page.getByRole('status').filter({ hasText: 'Currently hiding in' });
  await expect(card.getByRole('link', { name: 'Laboratory' })).toHaveAttribute('href', '/locations/laboratory');
  await expect(card).toContainText('Last seen there 20 minutes ago');
});

test('a failed load offers another try', async ({ page, consoleErrors }) => {
  let calls = 0;
  await page.route('https://api.mouse.rip/relic-hunter', (route) =>
    calls++ === 0 ? route.fulfill({ status: 503, body: 'down' }) : route.fulfill({ json: relicHunter() }),
  );
  await page.goto('/relic-hunter');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('status').getByRole('link', { name: 'Laboratory' })).toBeVisible();
  // The browser logs the 503 itself.
  consoleErrors.splice(0);
});
