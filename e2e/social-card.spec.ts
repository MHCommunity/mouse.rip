import { expect, test } from './fixtures';

test('a card link the site didn’t sign gets the site-wide card, not its own words', async ({ request }) => {
  for (const link of ['/og/card?title=Anything+at+all', '/og/card?title=Common&sig=0123456789abcdef0123456789abcdef']) {
    const response = await request.get(link, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('/og');
  }
});

test('a page’s own card link renders', async ({ page, request }) => {
  // A group's card has no picture, so rendering it asks nothing of the image host.
  await page.goto('/groups/common');
  const card = await page.locator('meta[property="og:image"]').getAttribute('content');
  test.skip(!card?.includes('/og/card'), 'Built without OG_CARD_SECRET, so pages use the site-wide card.');
  const { pathname, search } = new URL(card!);
  const response = await request.get(pathname + search, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
});
