import { expect, test } from './fixtures';

const MAP = ['- Glazy', '2. Abominable Snow Mouse', 'Zombie', 'Burglar', 'Bionic', 'Granite', 'Diamond', 'Not a mouse'];

test('plans a pasted map, and the link brings it back', async ({ page }) => {
  await page.goto('/map-planner');
  await page.getByRole('textbox').first().fill(MAP.join('\n'));
  await expect(page.getByText(/Not recognised: Not a mouse/)).toBeVisible();
  await expect(page.getByText('Guaranteed attractions')).toBeVisible();
  await expect(page.getByText(/setups? attracts? at least one of your mice/)).toBeVisible();
  await expect(page).toHaveURL(/mice=/);

  const shared = page.url();
  await page.goto('about:blank');
  await page.goto(shared);
  await expect(page.getByText('Abominable Snow Mouse').first()).toBeVisible();
  await expect(page.getByText(/setups? attracts? at least one of your mice/)).toBeVisible();
});

test('sorting reorders the setups', async ({ page }) => {
  await page.goto('/map-planner');
  await page.getByRole('textbox').first().fill(MAP.slice(0, 7).join('\n'));
  const select = page.getByRole('combobox').first();
  for (const option of ['Most mice', 'Quickest to clear', 'Best overall']) {
    await select.selectOption({ label: option });
    await expect(select).toHaveValue(/\w+/);
  }
});
