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

test('a location page link keeps the trap from the last visit', async ({ page }) => {
  await page.goto(`${STINGER}&gs=0`);
  await expect(stat(page, 'Power')).toHaveText(/\d/);
  // What "Catch rates here" on a location page opens.
  await page.goto('/catch-rate-estimator?location=harbour');
  await expect(page.getByLabel('Location')).toHaveValue('harbour');
  await expect(page.getByRole('combobox', { name: 'Weapon' })).toHaveValue('S.T.I.N.G.E.R. Trap');
  await expect(page.getByRole('combobox', { name: 'Base' })).toHaveValue('Rainbow Diamond Refractor Base');
  await expect(page.getByRole('checkbox', { name: 'Golden Shield' })).not.toBeChecked();
  await expect(page.getByText('Overall catch rate')).toBeVisible();
  // And it is still the saved setup afterwards.
  await page.goto('/catch-rate-estimator');
  await expect(page.getByRole('combobox', { name: 'Weapon' })).toHaveValue('S.T.I.N.G.E.R. Trap');
});

test('typing into a filled picker replaces what was picked', async ({ page }) => {
  await page.goto(STINGER);
  await expect(page.getByText('Overall catch rate')).toBeVisible();
  await page.getByRole('combobox', { name: 'Weapon' }).click();
  await page.keyboard.type('Sandtail');
  await expect(page.getByRole('combobox', { name: 'Weapon' })).toHaveValue('Sandtail');
  await page.getByRole('option', { name: /Sandtail Sentinel/ }).click();
  await expect(page).toHaveURL(/weapon=sentinel_weapon/);
});

test('a number field with a default can be cleared and retyped', async ({ page }) => {
  await page.goto('/catch-rate-estimator?location=zugzwang_tower&weapon=floating_law_upgraded_weapon&base=rift_base');
  const amplifier = page.getByLabel(/Amplifier/);
  await expect(amplifier).toHaveValue('100');
  await amplifier.click();
  await page.keyboard.press('End');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace');
  await expect(amplifier).toHaveValue('');
  await page.keyboard.type('150');
  await expect(amplifier).toHaveValue('150');
  await expect(page).toHaveURL(/amp=150/);
  // Over the maximum is held to it once the field is left.
  await amplifier.fill('999');
  await amplifier.blur();
  await expect(amplifier).toHaveValue('175');
});

test('clearing a bonus leaves the bonuses panel open', async ({ page }) => {
  await page.goto(`${STINGER}&bonus_luck=5`);
  const luck = page.getByLabel('Extra luck');
  await expect(luck).toBeVisible();
  await luck.fill('');
  await expect(luck).toBeVisible();
  await luck.fill('-7');
  await expect(page.getByText('+0% power, −7 luck')).toBeVisible();
});

test('a setup picked up from the last visit goes into the address, and Start over clears both', async ({ page }) => {
  await page.goto(STINGER);
  await expect(stat(page, 'Power')).toHaveText('16,027');
  await page.goto('/catch-rate-estimator');
  await expect(stat(page, 'Power')).toHaveText('16,027');
  await expect(page).toHaveURL(/weapon=floating_law_upgraded_weapon/);

  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.getByText('Pick a location, weapon and base')).toBeVisible();
  await expect(page).toHaveURL(/\/catch-rate-estimator$/);
  await page.reload();
  await expect(page.getByText('Pick a location, weapon and base')).toBeVisible();
});

test('a location opens on the cheese most hunted there', async ({ page }) => {
  await page.goto('/catch-rate-estimator?location=mountain&weapon=floating_law_upgraded_weapon&base=rift_base');
  await expect(page.getByLabel('Cheese')).not.toHaveValue('abominable_asiago_cheese');
  await expect(page.getByText('Overall catch rate')).toBeVisible();
});
