import { afterEach, beforeEach, expect, test } from 'bun:test';

import { OG_CARD_FIELDS, signOgCard, verifyOgCard } from '@/lib/og-signature';
import { ogCard } from '@/seo';

const card = { title: 'Glazy Mouse', subtitle: 'Event Mice', image: 'https://i.mouse.rip/images/mice/glazy.png' };

const env = process.env as Record<string, string | undefined>;
const before = { secret: env.OG_CARD_SECRET, mode: env.NODE_ENV };

beforeEach(() => {
  env.OG_CARD_SECRET = 'a key for the tests';
  env.NODE_ENV = 'production';
});

afterEach(() => {
  env.OG_CARD_SECRET = before.secret;
  env.NODE_ENV = before.mode;
});

test('a card the site signed checks out', () => {
  expect(verifyOgCard(card, signOgCard(card)!)).toBe(true);
});

test('changing any of the text or the picture breaks the signature', () => {
  const signature = signOgCard(card)!;
  expect(verifyOgCard({ ...card, title: 'Anything at all' }, signature)).toBe(false);
  expect(verifyOgCard({ ...card, subtitle: undefined }, signature)).toBe(false);
  expect(verifyOgCard({ ...card, eyebrow: 'mouse.rip says' }, signature)).toBe(false);
  expect(verifyOgCard({ ...card, image: 'https://i.mouse.rip/images/mice/zombie.png' }, signature)).toBe(false);
  expect(verifyOgCard({ ...card, banner: 'https://i.mouse.rip/images/locations/headers/meadow.jpg' }, signature)).toBe(
    false,
  );
});

test('text can’t be moved between fields under the same signature', () => {
  const signature = signOgCard({ title: 'a', subtitle: 'b' })!;
  expect(verifyOgCard({ title: 'a', eyebrow: 'b' }, signature)).toBe(false);
});

test('a missing, short, or non-ASCII signature is turned away without throwing', () => {
  expect(verifyOgCard(card, null)).toBe(false);
  expect(verifyOgCard(card, '')).toBe(false);
  expect(verifyOgCard(card, 'abc')).toBe(false);
  expect(verifyOgCard(card, 'é'.repeat(32))).toBe(false);
});

test('a signature made with another key is turned away', () => {
  const signature = signOgCard(card)!;
  env.OG_CARD_SECRET = 'some other key';
  expect(verifyOgCard(card, signature)).toBe(false);
});

test('a production build with no key signs nothing and accepts nothing', () => {
  const signature = signOgCard(card)!;
  delete env.OG_CARD_SECRET;
  expect(signOgCard(card)).toBeUndefined();
  expect(verifyOgCard(card, signature)).toBe(false);
  // Pages fall back to the site-wide card instead of linking to one that would be refused.
  expect(ogCard(card)).toBe('/og');
});

test('a card link carries its signature, and a missing field signs the same as an empty one', () => {
  const link = new URL(ogCard(card), 'https://mouse.rip');
  expect(link.pathname).toBe('/og/card');
  const sent = Object.fromEntries(OG_CARD_FIELDS.map((field) => [field, link.searchParams.get(field)]));
  expect(verifyOgCard(sent, link.searchParams.get('sig'))).toBe(true);
});
