import { expect, test } from './fixtures';

const results = 'main ul a[href^="/mice/"]';

test('Show all is still on after a visit to a mouse and Back, at the same place in the list', async ({ page }) => {
  await page.goto('/mice?q=mouse');
  await expect(page.locator(results)).toHaveCount(400);
  await page.getByRole('button', { name: /^Show all/ }).click();
  await expect(page.locator(results)).not.toHaveCount(400);

  const link = page.locator(results).nth(700);
  await link.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await link.click();
  await expect(page).toHaveURL(/\/mice\/[a-z0-9-]+$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/mice\?q=mouse$/);
  await expect.poll(() => page.locator(results).count()).toBeGreaterThan(700);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 400);

  // A different filter starts capped again.
  await page.getByLabel('Search mice by name').fill('mous');
  await expect(page.locator(results)).toHaveCount(400);
});
