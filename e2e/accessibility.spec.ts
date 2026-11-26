import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { PAGES } from './pages';

/** Pages with their tools filled in, so the results get checked as well as the empty form. */
const FILLED: { name: string; path: string; fill?: (page: Page) => Promise<void> }[] = [
  {
    name: 'map planner with a plan',
    path: '/map-planner',
    fill: async (page) => {
      await page.getByRole('textbox').first().fill('Glazy\nAbominable Snow\nZombie\nBurglar\nNot a mouse');
      await expect(page.getByText(/setups? attracts? at least one of your mice/)).toBeVisible();
    },
  },
  {
    name: 'rank-up calculator with an answer',
    path: '/rank-up-calculator?title=baron_baroness&target=duke_dutchess&progress=42.5&mouse=Glazy',
    fill: async (page) => {
      await expect(page.locator('section[aria-live]')).toContainText('catches of Glazy Mouse');
    },
  },
  {
    name: 'catch rate estimator with results',
    path: '/catch-rate-estimator?location=meadow&cheese=cheddar_cheese&weapon=floating_law_upgraded_weapon&base=rainbow_diamond_refractor_base&charm=ultimate_ancient_trinket',
    fill: async (page) => {
      await expect(page.getByText('Overall catch rate')).toBeVisible();
      await page.getByText('Auras and other bonuses').click();
    },
  },
  {
    name: 'best setup with results and my items',
    path: '/best-setup?location=fort_rox&stage=Midnight&cheese=crescent_cheese&own_weapons=dark_magic_mirror_weapon,acronym_weapon&own_bases=rift_base',
    fill: async (page) => {
      await expect(page.getByText('The setups that catch the most mice per 100 hunts.')).toBeVisible();
    },
  },
  { name: 'rankings, focused on a mouse', path: '/mice/rankings?by=gold&mouse=glazed' },
  { name: 'items, filtered', path: '/items?type=stat&sub=currency&tradable=1' },
  { name: 'mice, filtered to nothing', path: '/mice?q=zzzz' },
  {
    name: 'search open with results',
    path: '/',
    fill: async (page) => {
      await page.keyboard.press('ControlOrMeta+k');
      await page.getByRole('combobox').or(page.getByRole('searchbox')).last().fill('glazy');
      await expect(page.getByRole('option').first()).toBeVisible();
    },
  },
];

const CHECKS = [...PAGES.map((path) => ({ name: path, path, fill: undefined })), ...FILLED];

/** The WCAG 2.1 A and AA rules. */
async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.slice(0, 5).map((node) => node.target.join(' ')),
    count: violation.nodes.length,
  }));
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    for (const check of CHECKS) {
      test(`${check.name} meets WCAG 2.1 AA`, async ({ page }) => {
        await page.goto(check.path, { waitUntil: 'networkidle' });
        await check.fill?.(page);
        // Let transitions finish, so colours are measured at rest.
        await page.waitForTimeout(400);
        expect(await audit(page)).toEqual([]);
      });
    }
  });
}
