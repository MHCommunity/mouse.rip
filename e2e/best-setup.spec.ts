import { expect, test } from './fixtures';

const FORT_ROX = '/best-setup?location=fort_rox&stage=Midnight&cheese=crescent_cheese';

test('ranks every weapon and base for a location', async ({ page }) => {
  await page.goto(FORT_ROX);
  await expect(page.getByText('The setups that catch the most mice per 100 hunts.')).toBeVisible();
  const first = page.locator('main ol > li').first();
  await expect(first).toContainText('Shadow power');
  // Each result opens in the estimator with its setup filled in.
  await first.getByRole('link', { name: 'See each mouse' }).click();
  await expect(page).toHaveURL(/\/catch-rate-estimator\?.*weapon=/);
  await expect(page.getByText('Overall catch rate')).toBeVisible();
});

test('aims for one mouse', async ({ page }) => {
  await page.goto(FORT_ROX);
  await page.getByRole('radio', { name: /One mouse/ }).click();
  // A label around a select takes in its options' text, so find it by the label's first word.
  await page
    .locator('label', { hasText: /^Mouse/ })
    .locator('select')
    .selectOption({ label: 'Nightmancer Mouse' });
  await expect(page.getByText('The setups that catch the most Nightmancer Mouse per 100 hunts.')).toBeVisible();
  await expect(page).toHaveURL(/target=nightmancer/);
});

test('items sent in a link are searched, saved, and taken out of the address', async ({ page }) => {
  await page.goto(`${FORT_ROX}&own_weapons=dark_magic_mirror_weapon,acronym_weapon&own_bases=rift_base`);
  await expect(page.getByText(/Searching your 2 weapons, 1 bases and 0 charms/)).toBeVisible();
  await expect(page.locator('main ol > li')).toHaveCount(2);
  await expect(page).not.toHaveURL(/own_weapons/);
  // Still there on the next visit.
  await page.goto(FORT_ROX);
  await expect(page.locator('main ol > li')).toHaveCount(2);
});

test('ticking items narrows the search', async ({ page }) => {
  await page.goto(FORT_ROX);
  await page.getByRole('radio', { name: 'Only mine' }).click();
  await expect(page.getByText('No weapons or bases to try')).toBeVisible();
  await page.getByLabel('Find weapons').fill('Dark Magic');
  await page.getByRole('button', { name: 'Tick all shown', exact: true }).click();
  await page.getByRole('button', { name: /^Bases/ }).click();
  await page.getByLabel('Find bases').fill('Rift Base');
  await page.getByRole('checkbox', { name: 'Rift Base', exact: true }).check();
  await expect(page.locator('main ol > li').first()).toContainText('Dark Magic Mirrors');
  await expect(page.locator('main ol > li').first()).toContainText('Rift Base');
});
