import { expect, test } from './fixtures';

const result = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Result' });

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
  await page.getByRole('option', { name: 'Glazy Mouse' }).click();
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
  // On a first visit the target is Recruit; the wisdom is past that, so the target moves on from where it is.
  await expect(result(page)).toContainText('Wisdom needed for Count/Countess');
  await expect(page.getByLabel('Target title').locator('option').first()).toHaveText('Count/Countess');
});

test('the mouse list only loads when it is wanted', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  await page.goto('/rank-up-calculator', { waitUntil: 'networkidle' });
  const before = requested.length;
  await page.getByLabel(/In catches of/).fill('Glaz');
  await expect(page.getByRole('option', { name: 'Glazy Mouse' })).toBeVisible();
  expect(requested.length).toBeGreaterThan(before);
});

test('entries from the last visit go into the address, and Start over clears them', async ({ page }) => {
  await page.goto('/rank-up-calculator');
  await fillBaronToCount(page);
  await expect(result(page)).toContainText('4,900,621');
  await page.goto('/rank-up-calculator');
  await expect(page).toHaveURL(/title=baron_baroness.*progress=42\.5/);

  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.getByLabel('Progress to the next title (%)')).toHaveValue('');
  await expect(page).toHaveURL(/\/rank-up-calculator$/);
  await page.reload();
  await expect(page.getByLabel('Current title').locator('option:checked')).toHaveText('Novice');
});

test('wisdom per hunt from the estimator goes on top of the saved entries', async ({ page }) => {
  await page.goto('/rank-up-calculator');
  await fillBaronToCount(page);
  await expect(result(page)).toContainText('4,900,621');
  await page.goto('/rank-up-calculator?perhunt=500');
  await expect(result(page)).toContainText('4,900,621');
  await expect(result(page)).toContainText('About 9,802 hunts at 500 wisdom a hunt.');
  await expect(page).toHaveURL(/title=baron_baroness.*perhunt=500/);
});
