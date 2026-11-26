import { expect, test } from './fixtures';

const result = (page: import('@playwright/test').Page) => page.locator('section[aria-live]');

async function fillBaronToCount(page: import('@playwright/test').Page) {
  await page.getByLabel('Current title').selectOption({ label: 'Baron/Baroness' });
  await page.getByLabel('Progress to the next title (%)').fill('42.5');
  await page.getByLabel('Target title').selectOption({ label: 'Count/Countess' });
}

test('works out the wisdom and catches needed', async ({ page }) => {
  await page.goto('/rank-up-calculator');
  await fillBaronToCount(page);
  await expect(result(page)).toContainText('4,900,621');
  await page.getByLabel(/In catches of/).fill('Glazy');
  await expect(result(page)).toContainText('1,362 catches of Glazy Mouse');
  await expect(page).toHaveURL(/title=baron_baroness.*progress=42\.5.*mouse=Glazy/);
});

test('a shared link opens with its entries', async ({ page }) => {
  await page.goto('/rank-up-calculator?title=baron_baroness&target=count_countess&progress=42.5&mouse=Glazy');
  await expect(result(page)).toContainText('4,900,621');
  await expect(result(page)).toContainText('1,362 catches of Glazy Mouse');
});

test('a return visit picks up where it left off', async ({ page }) => {
  await page.goto('/rank-up-calculator');
  await fillBaronToCount(page);
  await expect(result(page)).toContainText('4,900,621');
  await page.goto('/rank-up-calculator');
  await expect(result(page)).toContainText('4,900,621');
  await expect(page.getByLabel('Current title')).toHaveValue(/\d+/);
});

test('exact wisdom replaces the title and progress', async ({ page }) => {
  await page.goto('/rank-up-calculator');
  await page.getByLabel(/Exact wisdom/).fill('7500000');
  await expect(page.getByLabel(/Exact wisdom/)).toHaveValue('7,500,000');
  await expect(page.getByLabel('Progress to the next title (%)')).toBeDisabled();
});

test('the mouse list only loads when it is wanted', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  await page.goto('/rank-up-calculator', { waitUntil: 'networkidle' });
  const before = requested.length;
  await page.getByLabel(/In catches of/).focus();
  await expect(page.locator('#wisdom-mice option').first()).toBeAttached();
  expect(requested.length).toBeGreaterThan(before);
});
