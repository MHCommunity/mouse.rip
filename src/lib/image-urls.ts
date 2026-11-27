const IMAGE_ORIGIN = 'https://i.mouse.rip';

function assetSlug(value: string): string {
  return value.replaceAll('_', '-');
}

/**
 * Item art kept in this repo (public/images/items/large) instead of on the CDN, because the game's file is far
 * heavier than a 160px picture needs: every one of these is over 500 KB there, up to 4.5 MB. The copies here are
 * 320px. To add another: put a resized copy in that folder and its slug here.
 */
export const LOCAL_ITEM_ART = new Set([
  // Animated in the game (12 to 83 frames); stills here.
  'cerulean-chrome-ingot-stat-item',
  'dragons-eye-stat-item',
  'idea-germ-stat-item',
  'mythical-dragon-heart-stat-item',
  'mythical-rainbow-diamond-convertible',
  'origin-of-dragons-scroll-case-convertible',
  // Plain pictures at 1000px or more.
  'airship-balloon-vrift-stat-item',
  'chrome-dragon-slayer-cannon-kit-crafting-item',
  'sb-supply-pack',
  'winter-hunt-2025-journal-theme-collectible',
]);

export function itemImageUrl(typeOrSlug: string, size: 'large' | 'thumbnail' | 'trap' = 'thumbnail'): string {
  const slug = assetSlug(typeOrSlug);
  if (size === 'large' && LOCAL_ITEM_ART.has(slug)) return `/images/items/large/${slug}.png`;
  return itemCdnImageUrl(typeOrSlug, size);
}

/** The CDN's copy whatever is kept locally, for the social card: that route only fetches art from the CDN. */
export function itemCdnImageUrl(typeOrSlug: string, size: 'large' | 'thumbnail' | 'trap' = 'thumbnail'): string {
  return `${IMAGE_ORIGIN}/images/items/${size}/${assetSlug(typeOrSlug)}.png`;
}

export function mouseImageUrl(typeOrSlug: string, size: 'large' | 'square' | 'thumbnail' = 'thumbnail'): string {
  return `${IMAGE_ORIGIN}/images/mice/${size}/${assetSlug(typeOrSlug)}.png`;
}

export function mouseGroupImageUrl(groupId: string): string {
  return `${IMAGE_ORIGIN}/images/mice/groups/${assetSlug(groupId)}.jpg`;
}

export function locationImageUrl(locationId: string): string {
  return `${IMAGE_ORIGIN}/images/locations/${assetSlug(locationId)}.png`;
}

export function locationHeaderImageUrl(locationId: string): string {
  return `${IMAGE_ORIGIN}/images/locations/headers/${assetSlug(locationId)}.jpg`;
}

/**
 * Title icons are in this repo (public/images/titles) at 80px: the game's are 350px and about 100 KB each, for a
 * badge shown at 40px. A new title needs its icon added there; tests/links.test.ts checks none is missing.
 */
export function titleImageUrl(titleId: string): string {
  return `/images/titles/${assetSlug(titleId)}.png`;
}
