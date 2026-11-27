import { expect, test as base, type Page } from '@playwright/test';

/** A 1×1 transparent PNG, served for every game image so the tests don't wait on i.mouse.rip. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/** Timers that are always current, whenever the tests run. */
export function timers() {
  const hour = 3_600_000;
  const now = Date.now();
  const iso = (offset: number) => new Date(now + offset).toISOString();
  return {
    now: iso(0),
    daily_reset: { at: iso(10 * hour) },
    locations: [
      {
        id: 'forbidden_grove',
        name: 'Forbidden Grove',
        current: { name: 'Open', starts_at: iso(-hour), ends_at: iso(2 * hour) },
        upcoming: [
          { name: 'Closed', starts_at: iso(2 * hour), ends_at: iso(6 * hour) },
          { name: 'Open', starts_at: iso(6 * hour), ends_at: iso(26 * hour) },
        ],
      },
    ],
  };
}

/** Where the Relic Hunter is, as api.mouse.rip answers. */
export function relicHunter() {
  return {
    id: 'laboratory',
    name: 'Laboratory',
    image: 'https://www.mousehuntgame.com/images/environments/laboratory.jpg',
    last_seen: new Date(Date.now() - 20 * 60_000).toISOString(),
  };
}

/** A month of prices ending `endedDaysAgo` days back, so an item's price chart has something to draw. */
export function marketHistory(itemId: number, endedDaysAgo = 0) {
  const day = 86_400_000;
  const start = Date.now() - (30 + endedDaysAgo) * day;
  return {
    item_info: { item_id: itemId, name: 'Test item', currently_tradeable: true },
    market_data: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(start + i * day).toISOString().slice(0, 10),
      price: 1000 + i * 10,
      sb_price: 1 + i / 100,
      volume: 100 + i,
    })),
  };
}

/** Serve the site's outside requests from here, so a slow or changed service can't fail a test. */
async function stubOutsideServices(page: Page) {
  await page.route('https://i.mouse.rip/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL }),
  );
  await page.route('https://api.mouse.rip/timers', (route) => route.fulfill({ json: timers() }));
  await page.route('https://api.mouse.rip/relic-hunter', (route) => route.fulfill({ json: relicHunter() }));
  await page.route('https://api.markethunt.win/items', (route) => route.fulfill({ json: [] }));
  await page.route(/^https:\/\/api\.markethunt\.win\/items\/(\d+)$/, (route) =>
    route.fulfill({ json: marketHistory(Number(route.request().url().split('/').pop())) }),
  );
}

/**
 * Every test fails on a console error or an uncaught exception: that's how a hydration mismatch shows up,
 * and it's easy to miss by eye.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      await stubOutsideServices(page);
      await use(errors);
      expect(errors, 'console errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
