import { expect, test } from './fixtures';
import { PAGES } from './pages';

for (const path of PAGES) {
  test(`${path} renders and hydrates`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page).toHaveTitle(/\S/);
  });
}

test('an unknown page is a 404 with a way back', async ({ page, consoleErrors }) => {
  const response = await page.goto('/mice/not-a-real-mouse');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible();
  // The browser logs the 404 response itself.
  consoleErrors.splice(0);
});
