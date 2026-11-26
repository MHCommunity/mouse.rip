import { expect, test } from './fixtures';

const rows = 'main tbody tr';

test('shows 100 mice and loads more on scroll', async ({ page }) => {
  await page.goto('/mice/rankings');
  await expect(page.locator(rows)).toHaveCount(100);
  await page.getByRole('button', { name: /^Show 100 more of/ }).scrollIntoViewIfNeeded();
  await expect(page.locator(rows)).toHaveCount(200);
});

test('ranks are shared on ties and kept when filtering', async ({ page }) => {
  await page.goto('/mice/rankings?by=points');
  const ranks = await page.locator(`${rows} td:first-child`).allInnerTexts();
  expect(ranks.slice(0, 5)).toEqual(['1', '2', '3', '3', '3']);

  await page.getByRole('searchbox', { name: 'Find a mouse' }).fill('glazy');
  await expect(page.locator(rows)).toHaveCount(1);
  await expect(page.locator(rows).first()).toContainText('Glazy Mouse');
  await expect(page.locator(`${rows} td:first-child`).first()).not.toHaveText('1');

  await page.getByRole('searchbox', { name: 'Find a mouse' }).fill('zzzz');
  await expect(page.getByText('No mice match “zzzz”.')).toBeVisible();
});

test('sorting keeps the choice in the URL', async ({ page }) => {
  await page.goto('/mice/rankings');
  await page.getByRole('button', { name: 'Wisdom' }).click();
  await expect(page).toHaveURL(/by=wisdom/);
  await expect(page.getByRole('button', { name: 'Wisdom' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Group').selectOption('Event Mice');
  await expect(page).toHaveURL(/group=Event\+Mice/);
});

test('a rank on a mouse page lands on that mouse, highlighted, even far down the list', async ({ page }) => {
  await page.goto('/mice/draconic-warden');
  await page
    .getByRole('link', { name: /^[\d,]+$/ })
    .nth(1)
    .click();
  await expect(page).toHaveURL(/\/mice\/rankings\?by=gold&mouse=draconic-warden/);
  const row = page.locator('#draconic-warden');
  await expect(row).toBeInViewport();
  await expect(row).toHaveClass(/bg-pink-50/);
  // Centred, not stuck under the header or at the bottom.
  const box = await row.boundingBox();
  expect(box?.y).toBeGreaterThan(200);
  expect(box?.y).toBeLessThan(700);
});

test('the name filter goes in the address, and an empty result can be cleared', async ({ page }) => {
  await page.goto('/mice/rankings');
  const search = page.getByRole('searchbox', { name: 'Find a mouse' });
  await search.fill('glazy');
  await expect(page).toHaveURL(/q=glazy/);

  await page.goto('/mice/rankings?by=gold&q=glazy');
  await expect(page.locator(rows)).toHaveCount(1);

  await search.fill('zzzz');
  await page.getByRole('button', { name: 'Clear the search' }).click();
  await expect(page.locator(rows)).toHaveCount(100);
  await expect(search).toBeFocused();
});

test('going to a mouse and Back returns to the same place in a long list', async ({ page }) => {
  await page.goto('/mice/rankings');
  for (const count of [200, 300]) {
    await page.getByRole('button', { name: /^Show 100 more of/ }).scrollIntoViewIfNeeded();
    await expect(page.locator(rows)).toHaveCount(count);
  }
  const link = page.locator(rows).nth(250).getByRole('link');
  await link.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await link.click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Mice ranked');
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mice ranked');
  expect(await page.locator(rows).count()).toBeGreaterThanOrEqual(300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 400);
});
