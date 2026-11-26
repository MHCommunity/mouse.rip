import { createHmac, timingSafeEqual } from 'node:crypto';

/** What a social card is made of, in the order it's signed. */
export const OG_CARD_FIELDS = ['title', 'subtitle', 'eyebrow', 'image', 'banner', 'icon', 'accent'] as const;

/** The icons a card can draw in place of a picture: the ones the tools' page headers use. */
export type OgCardIcon =
  | 'scale'
  | 'trophy'
  | 'sparkles'
  | 'map-pin'
  | 'building'
  | 'beaker'
  | 'fire'
  | 'map'
  | 'trending-up';

/** The colours a card can take: its title, its background wash, and the tile behind an icon. */
export type OgCardAccent = 'emerald' | 'blue' | 'pink' | 'amber' | 'sky' | 'violet' | 'green' | 'rose' | 'orange';

export type OgCardValues = Partial<Record<(typeof OG_CARD_FIELDS)[number], string | null>>;

/**
 * The key the site signs its card links with. It has to be the same when the pages are built and when the
 * Worker checks a link: an `.env.local` covers both, since OpenNext packs it into the Worker. `next dev` gets a
 * stand-in so cards render there; a production build without the key gets none.
 */
function secret(): string | undefined {
  return process.env.OG_CARD_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev');
}

/**
 * The signature for one card's text and picture, or undefined when the site has no key.
 *
 * `/og/card` renders whatever text it's handed, on the Worker that serves every page. Signing the links the
 * site's own pages make, and turning the rest away, keeps the route from rendering strangers' words under the
 * mouse.rip name, and from being made to render endlessly.
 */
export function signOgCard(values: OgCardValues): string | undefined {
  const key = secret();
  if (!key) return undefined;
  // As JSON, so no choice of title and subtitle can add up to the same signed text as another pair.
  const signed = JSON.stringify(OG_CARD_FIELDS.map((field) => values[field] ?? ''));
  return createHmac('sha256', key).update(signed).digest('hex').slice(0, 32);
}

/** Whether `signature` is the one the site would have given this card. */
export function verifyOgCard(values: OgCardValues, signature: string | null): boolean {
  const expected = signOgCard(values);
  if (!expected || !signature) return false;
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, so that's ruled out first.
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}
