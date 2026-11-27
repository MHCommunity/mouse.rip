import { expect, test } from './fixtures';

test('amounts pasted from the Crafting Table fill every box, wherever the cursor is', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/essence-calculator');
  await page.evaluate(() => navigator.clipboard.writeText('12 Aleth Essence\n5 Ber Essence\n1,250 Cynd Essence'));
  // With a box focused, as it has to be on a phone, the pasted text used to be typed into that box as well.
  await page.getByLabel('Aleth').click();
  await page.keyboard.press('ControlOrMeta+v');
  await expect(page.getByLabel('Aleth')).toHaveValue('12');
  await expect(page.getByLabel('Ber')).toHaveValue('5');
  await expect(page.getByLabel('Cynd')).toHaveValue('1250');
});

test('a plain number pastes into the box it was pasted in', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/essence-calculator');
  await page.evaluate(() => navigator.clipboard.writeText('40'));
  await page.getByLabel('Ber').click();
  await page.keyboard.press('ControlOrMeta+v');
  await expect(page.getByLabel('Ber')).toHaveValue('40');
  await expect(page.getByLabel('Aleth')).toHaveValue('');
});
