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

test('a mouse address typed from its name offers the mouse', async ({ page, consoleErrors }) => {
  await page.goto('/mice/glazy');
  const suggestions = page.getByRole('region', { name: 'Were you looking for one of these?' });
  await expect(suggestions.getByRole('link', { name: /Glazy Mouse/ })).toHaveAttribute('href', '/mice/glazed');
  consoleErrors.splice(0);
});

test('the /cre short link goes to the catch rate estimator', async ({ page }) => {
  await page.goto('/cre');
  await expect(page).toHaveURL(/\/catch-rate-estimator$/);
});

test('a linked page is fetched when its link is pointed at, not when it scrolls into view', async ({ page }) => {
  const fetched: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('_rsc=')) fetched.push(new URL(request.url()).pathname);
  });
  await page.goto('/groups/common', { waitUntil: 'networkidle' });
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(500);
  expect(fetched).toEqual([]);

  const link = page.locator('main a[href^="/mice/"]').first();
  const href = await link.getAttribute('href');
  await link.hover();
  await expect.poll(() => fetched).toContain(href);
});

test('the items and mice pages arrive with their content, not waiting on JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/items');
  await expect(page.getByRole('heading', { name: 'Browse by type' })).toBeVisible();
  await expect(page.locator('a[href="/items/type/weapon"]')).toBeVisible();
  await page.goto('/mice');
  await expect(page.getByRole('heading', { name: 'Browse by group' })).toBeVisible();
  await context.close();
});

test('a trap effects link opens on its location, and the list is in the page without JavaScript', async ({
  page,
  browser,
}) => {
  await page.goto('/trap-special-effects?location=meadow');
  await expect(page.getByLabel('Location', { exact: true })).toHaveValue('meadow');
  await expect(page.getByRole('heading', { level: 2, name: 'Meadow' })).toBeVisible();

  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto('/trap-special-effects');
  await expect(plain.getByRole('heading', { name: 'In many locations' })).toBeVisible();
  await context.close();
});
