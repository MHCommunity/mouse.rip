import { expect, test } from './fixtures';

const STINGER =
  '/catch-rate-estimator?location=meadow&cheese=cheddar_cheese&weapon=floating_law_upgraded_weapon&base=rainbow_diamond_refractor_base&charm=ultimate_ancient_trinket';

const stat = (page: import('@playwright/test').Page, label: string) =>
  page
    .locator('dl > div')
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator('dd');

test('a shared link opens with its setup and results', async ({ page }) => {
  await page.goto(STINGER);
  await expect(page.getByText('Overall catch rate')).toBeVisible();
  await expect(stat(page, 'Power')).toHaveText('16,027');
  await expect(stat(page, 'Luck')).toHaveText('77');
  await expect(stat(page, 'Attraction bonus')).toHaveText('73%');
  await expect(page.getByRole('table')).toContainText('Mouse');
});

test('picking a setup by hand fills in the results and the link', async ({ page }) => {
  await page.goto('/catch-rate-estimator');
  await expect(page.getByText('Pick a location, weapon and base')).toBeVisible();
  await page.getByLabel('Location').selectOption({ label: 'Meadow' });
  await page.getByRole('combobox', { name: 'Weapon' }).fill('S.T.I.N');
  await page.getByRole('option', { name: /S\.T\.I\.N\.G\.E\.R\. Trap/ }).click();
  await page.getByRole('combobox', { name: 'Base' }).fill('Rainbow Diamond');
  await page.getByRole('option', { name: /Rainbow Diamond Refractor Base/ }).click();
  await expect(page.getByText('Overall catch rate')).toBeVisible();
  await expect(page).toHaveURL(/weapon=floating_law_upgraded_weapon/);
  await expect(page).toHaveURL(/base=rainbow_diamond_refractor_base/);
});

test('matching the camp works out the aura bonuses', async ({ page }) => {
  await page.goto(STINGER);
  await page.getByText('Auras and other bonuses').click();
  await page.getByLabel('Power shown').fill('20741');
  await page.getByLabel('Luck shown').fill('83');
  await page.getByRole('button', { name: 'Use +45% power and +6 luck' }).click();
  await expect(stat(page, 'Power')).toHaveText('20,741');
  await expect(stat(page, 'Luck')).toHaveText('83');
  await expect(page).toHaveURL(/bonus_power=45/);
});

test('a mouse the power type can’t catch says so', async ({ page }) => {
  await page.goto(
    '/catch-rate-estimator?location=fort_rox&stage=Midnight&cheese=crescent_cheese&weapon=chrome_monstrobot_weapon&base=rainbow_diamond_refractor_base',
  );
  await expect(page.getByText(/None of these mice can be caught with Physical power/)).toBeVisible();
  await expect(page.getByText('Immune').first()).toBeVisible();
});

test('a return visit picks up the last setup', async ({ page }) => {
  await page.goto(STINGER);
  await expect(stat(page, 'Power')).toHaveText('16,027');
  await page.goto('/catch-rate-estimator');
  await expect(stat(page, 'Power')).toHaveText('16,027');
});
