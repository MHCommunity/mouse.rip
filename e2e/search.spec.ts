import { expect, test } from './fixtures';

test('the search box finds a mouse and opens its page', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const box = page.getByRole('combobox').or(page.getByRole('searchbox')).last();
  await box.fill('glazy');
  await expect(page.getByRole('option').first()).toContainText('Glazy Mouse');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/mice\/glazed$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Glazy/);
});

test('search copes with typos and everyday words', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const box = page.getByRole('combobox').or(page.getByRole('searchbox')).last();
  for (const [query, first] of [
    ['relc hunter', 'Relic Hunter'],
    ["i'm new", 'MouseHunt Essentials Guide'],
    ['tse', 'Trap and base special effects'],
  ]) {
    await box.fill(query);
    await expect(page.getByRole('option').first()).toContainText(first);
  }
});
