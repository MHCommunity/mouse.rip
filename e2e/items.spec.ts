import { expect, marketHistory, test } from './fixtures';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]) {
  test(`Tradable only stays put as the type chips change (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/items');
    const toggle = page.getByText('Tradable only');
    const before = await toggle.boundingBox();

    await page.getByLabel('Search items by name').fill('egg');
    await page.waitForTimeout(400);
    expect(await toggle.boundingBox()).toEqual(before);

    await toggle.click();
    await page.waitForTimeout(400);
    expect(await toggle.boundingBox()).toEqual(before);
  });
}

test('Special items split into the game’s own groups', async ({ page }) => {
  await page.goto('/items?type=stat');
  const groups = page.getByRole('group', { name: 'Special groups' });
  await expect(groups).toBeVisible();
  await groups.getByRole('button', { name: /Currency/ }).click();
  await expect(page).toHaveURL(/sub=currency/);
});

test('a type page links to each of its groups', async ({ page }) => {
  await page.goto('/items/type/stat');
  const nav = page.getByRole('navigation', { name: /by group/ });
  await expect(nav.getByRole('link')).not.toHaveCount(0);
});

test('a price shows its trend while the item is trading', async ({ page }) => {
  await page.goto('/items/super-brie-cheese');
  await expect(page.getByText(/over 90 days/)).toBeVisible();
  await expect(page.getByText(/Last traded/)).toHaveCount(0);
});

test('an item that stopped trading says when, instead of a trend', async ({ page }) => {
  await page.route(/^https:\/\/api\.markethunt\.win\/items\/\d+$/, (route) =>
    route.fulfill({ json: marketHistory(114, 400) }),
  );
  await page.goto('/items/super-brie-cheese');
  await expect(page.getByText(/^Last traded \w+ \d+, \d{4}$/)).toBeVisible();
  await expect(page.getByText(/over 90 days/)).toHaveCount(0);
});

test('a price response that has changed shape leaves the page standing', async ({ page }) => {
  await page.route(/^https:\/\/api\.markethunt\.win\/items\/\d+$/, (route) =>
    route.fulfill({ json: { market_data: [null, { date: 5 }, 'nope'] } }),
  );
  await page.goto('/items/super-brie-cheese', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/SUPER/);
  await expect(page.getByRole('heading', { name: 'Marketplace price' })).toHaveCount(0);
});

test('the price chart can be read as a table', async ({ page }) => {
  await page.goto('/items/super-brie-cheese');
  await page.getByText('Show these prices as a table').click();
  const table = page.getByRole('table', { name: 'Price and amount traded for each day in the chart' });
  await expect(table.getByRole('row')).toHaveCount(31);
});
