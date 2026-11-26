import { expect, test } from './fixtures';

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
