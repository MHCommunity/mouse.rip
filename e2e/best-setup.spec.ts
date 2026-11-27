import { expect, test } from './fixtures';

const FORT_ROX = '/best-setup?location=fort_rox&stage=Midnight&cheese=crescent_cheese';

test('ranks every weapon and base for a location', async ({ page }) => {
  await page.goto(FORT_ROX);
  await expect(page.getByText('The setups that catch the most mice per 100 hunts.')).toBeVisible();
  const first = page.locator('#results ol > li').first();
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
  await expect(page.getByText(/Searching your 2 weapons, 1 base, and 0 charms/)).toBeVisible();
  await expect(page.locator('#results ol > li')).toHaveCount(2);
  await expect(page).not.toHaveURL(/own_weapons/);
  // Still there on the next visit.
  await page.goto(FORT_ROX);
  await expect(page.locator('#results ol > li')).toHaveCount(2);
});

test('ticking items narrows the search', async ({ page }) => {
  await page.goto(FORT_ROX);
  await page.getByRole('radio', { name: 'Only mine' }).click();
  // Exact, so the screen-reader status line that says the same thing with a full stop isn't matched too.
  await expect(page.getByText('No weapons or bases to try', { exact: true })).toBeVisible();
  await page.getByLabel('Find weapons').fill('Dark Magic');
  await page.getByRole('button', { name: 'Tick all shown', exact: true }).click();
  await page.getByRole('button', { name: /^Bases/ }).click();
  await page.getByLabel('Find bases').fill('Rift Base');
  await page.getByRole('checkbox', { name: 'Rift Base', exact: true }).check();
  await expect(page.locator('#results ol > li').first()).toContainText('Dark Magic Mirrors');
  await expect(page.locator('#results ol > li').first()).toContainText('Rift Base');
});

test('looking at every item and coming back keeps the ticked items', async ({ page }) => {
  await page.goto(FORT_ROX);
  await page.getByRole('radio', { name: 'Only mine' }).click();
  await page.getByLabel('Find weapons').fill('Dark Magic');
  await page.getByRole('button', { name: 'Tick all shown', exact: true }).click();
  await expect(page.getByText(/Searching your 2 weapons/)).toBeVisible();

  await page.getByRole('radio', { name: 'Every item' }).click();
  await expect(page.getByText(/Searching every weapon and base in the game/)).toBeVisible();
  await page.getByRole('radio', { name: 'Only mine' }).click();
  await expect(page.getByText(/Searching your 2 weapons/)).toBeVisible();

  // The list, and the choice to search every item, are both there on the next visit.
  await page.getByRole('radio', { name: 'Every item' }).click();
  await page.goto(FORT_ROX);
  await expect(page.getByRole('radio', { name: 'Every item' })).toBeChecked();
  await page.getByRole('radio', { name: 'Only mine' }).click();
  await expect(page.getByText(/Searching your 2 weapons/)).toBeVisible();
});

test('clearing every tick at once can be undone', async ({ page }) => {
  await page.goto(`${FORT_ROX}&own_weapons=dark_magic_mirror_weapon,acronym_weapon&own_bases=rift_base`);
  await expect(page.getByText(/Searching your 2 weapons, 1 base,/)).toBeVisible();
  await page.getByRole('button', { name: 'Untick all', exact: true }).click();
  await expect(page.getByText(/Searching your 0 weapons, 1 base,/)).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByText(/Searching your 2 weapons, 1 base,/)).toBeVisible();
});

test('a list from a link can be swapped back for the saved one', async ({ page }) => {
  await page.goto(`${FORT_ROX}&own_weapons=dark_magic_mirror_weapon,acronym_weapon&own_bases=rift_base`);
  await expect(page.getByText(/Searching your 2 weapons, 1 base,/)).toBeVisible();
  // Someone else's link, with a different list in it.
  await page.goto(`${FORT_ROX}&own_weapons=acronym_weapon&own_bases=rift_base`);
  await expect(page.getByText(/Searching your 1 weapon, 1 base,.*These came from the link you opened/)).toBeVisible();
  await page.getByRole('button', { name: 'Use my saved items instead' }).click();
  await expect(page.getByText(/Searching your 2 weapons, 1 base,/)).toBeVisible();
  // A link with the parameters but no items in them changes nothing.
  await page.goto(`${FORT_ROX}&own_weapons=&own_bases=`);
  await expect(page.getByText(/Searching your 2 weapons, 1 base,/)).toBeVisible();
  await expect(page).not.toHaveURL(/own_weapons/);
});

test('a link that only names a location keeps the charm, shield and bonuses', async ({ page }) => {
  await page.goto(`${FORT_ROX}&gs=0&bonus_luck=5&charm=ultimate_ancient_trinket`);
  await expect(page.getByRole('checkbox', { name: 'Golden Shield' })).not.toBeChecked();
  // What a location page's "Best setup here" opens.
  await page.goto('/best-setup?location=meadow');
  await expect(page.getByLabel('Location')).toHaveValue('meadow');
  await expect(page.getByRole('checkbox', { name: 'Golden Shield' })).not.toBeChecked();
  await expect(page.getByLabel('Extra luck')).toHaveValue('5');
  await expect(page.getByRole('combobox', { name: 'Charm' })).toHaveValue('Ultimate Ancient Charm');
});

test('setups that tie at the top say so', async ({ page }) => {
  await page.goto('/best-setup?location=meadow&cheese=cheddar_cheese');
  await expect(page.getByText(/catch the same, so any of them will do\./)).toBeVisible();
});

test('a mouse page opens Best Setup aimed at that mouse, with the saved shield and bonuses', async ({ page }) => {
  await page.goto(`${FORT_ROX}&gs=0&bonus_luck=5`);
  await expect(page.getByRole('checkbox', { name: 'Golden Shield' })).not.toBeChecked();

  await page.goto('/mice/glazed');
  await page.getByRole('link', { name: 'Best setup for this mouse' }).click();
  await expect(page).toHaveURL(/\/best-setup\?location=winter_hunt_fortress.*target=glazed/);
  await expect(page.getByText('The setups that catch the most Glazy Mouse per 100 hunts.')).toBeVisible();
  await expect(page.getByRole('radio', { name: /One mouse/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Golden Shield' })).not.toBeChecked();
  await expect(page.getByLabel('Extra luck')).toHaveValue('5');
});

test('the choices work with the arrow keys, as radios do', async ({ page }) => {
  await page.goto(FORT_ROX);
  await page.getByRole('radio', { name: /Most catches/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: /One mouse/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /One mouse/ })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio', { name: /Most catches/ })).toBeChecked();
});
