import 'server-only';

import type { AttractionRow, ConvertibleRow, GameItem, ItemDrops, Mouse } from '@/types';
import { POWER_TYPES, powerTypeLabel } from '@/lib/power-types';
import { cleanDescription, formatNumber } from '@/utils';
import { mouseImageUrl } from '@/lib/image-urls';

/**
 * Titles and descriptions for the mouse and item pages.
 *
 * These are built from the data on the page, not from the game's flavour text,
 * because the flavour text answers nothing anyone searches for. People look up
 * "acolyte mouse minluck" and "what's in a champion's chest" — so the snippet
 * leads with the best cheese, the minluck, the drop rate, the contents. The
 * point is that the search result answers the question before the click.
 */

/** Google truncates around 160; leave room rather than getting cut mid-word. */
const MAX_DESCRIPTION = 158;

function trim(text: string): string {
  if (text.length <= MAX_DESCRIPTION) return text;
  const cut = text.slice(0, MAX_DESCRIPTION);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : cut.length).trimEnd()}…`;
}

/** Join the parts that exist into sentences, and cap the result. */
function sentences(...parts: (string | null | undefined)[]): string {
  return trim(parts.filter(Boolean).join(' '));
}

/** The power type a mouse is easiest to catch with: the lowest non-zero minluck. */
function bestMinluck(mouse: Mouse): { type: string; value: number } | null {
  const minlucks = mouse.minlucks as Record<string, number | undefined> | undefined;
  if (!minlucks) return null;

  let best: { type: string; value: number } | null = null;
  for (const type of POWER_TYPES) {
    const value = minlucks[type];
    if (!value || value <= 0) continue;
    if (!best || value < best.value) best = { type, value };
  }
  return best;
}

export function mouseSeo(mouse: Mouse, attraction: AttractionRow[]) {
  const best = attraction[0];
  const minluck = bestMinluck(mouse);

  const where = best
    ? `Best caught in ${best.location}${best.stage ? ` (${best.stage})` : ''} with ${best.cheese} — ${(best.rate / 100).toFixed(2)}% attraction rate.`
    : null;

  const luck = minluck ? `Minluck ${formatNumber(minluck.value)} ${powerTypeLabel(minluck.type)}.` : null;

  const worth =
    mouse.points || mouse.gold
      ? `Worth ${formatNumber(mouse.points)} points and ${formatNumber(mouse.gold)} gold.`
      : null;

  // Fall back to the game's own text only when we have no data of our own.
  const fallback = cleanDescription(mouse.description ?? '');

  return {
    title: `${mouse.name} — How to Catch, Minluck & Attraction Rates`,
    description:
      sentences(where, luck, worth) ||
      trim(fallback) ||
      `Stats, minlucks, and attraction rates for the ${mouse.name} in MouseHunt.`,
  };
}

interface ItemStats {
  power_type?: string;
  has_power?: boolean;
  power?: number;
  has_luck?: boolean;
  luck?: number;
  has_attraction_bonus?: boolean;
  attraction_bonus?: number;
  has_cheese_effect?: boolean;
  cheese_effect?: string;
}

/**
 * An item page's job depends on what the item is: a chest is looked up for its
 * contents, a trap for its stats, a loot item for where it drops. Lead with
 * whichever one this item actually has.
 */
export function itemSeo(item: GameItem, { contents, drops }: { contents: ConvertibleRow[]; drops: ItemDrops }) {
  const stats = (item.has_stats && typeof item.has_stats === 'object' ? item.has_stats : null) as ItemStats | null;
  const fallback = cleanDescription(item.description ?? '');

  // A chest: what's in it, and how likely.
  if (contents.length > 0) {
    const top = contents
      .slice(0, 2)
      .map((row) => row.name)
      .join(' and ');
    const rest = contents.length - 2;
    const yields = rest > 0 ? `Can contain ${top}, and ${formatNumber(rest)} other rewards.` : `Can contain ${top}.`;

    return {
      title: `${item.name} — What's Inside & Drop Odds`,
      description: sentences(yields, 'Full contents with the odds for each, plus where to get one.'),
    };
  }

  // A trap, base, or charm: its numbers are the reason anyone looks it up.
  if (stats?.has_power && stats.power) {
    const parts = [
      `${formatNumber(stats.power)} ${stats.power_type ? powerTypeLabel(stats.power_type).toLowerCase() : ''} power`.trim(),
      stats.has_luck && stats.luck ? `${formatNumber(stats.luck)} luck` : null,
      stats.has_attraction_bonus && stats.attraction_bonus
        ? `${Math.round(stats.attraction_bonus * 100)}% attraction bonus`
        : null,
    ].filter(Boolean);

    return {
      title: `${item.name} — Power, Luck & Stats`,
      description: sentences(
        `${item.name}: ${parts.join(', ')}.`,
        stats.has_cheese_effect && stats.cheese_effect ? `${stats.cheese_effect}.` : null,
        'Full stats and where to get it.',
      ),
    };
  }

  // Loot: where it drops and how often.
  const bestDrop = drops.rows[0];
  if (bestDrop) {
    return {
      title: `${item.name} — Where It Drops & Drop Rates`,
      description: sentences(
        `${item.name} drops in ${bestDrop.location}${bestDrop.stage ? ` (${bestDrop.stage})` : ''} with ${bestDrop.cheese}, at a ${bestDrop.drop_pct}% drop rate.`,
        drops.total > 1 ? `Drop rates across ${formatNumber(drops.total)} location and cheese combinations.` : null,
      ),
    };
  }

  return {
    title: `${item.name} — MouseHunt Item`,
    description: trim(fallback) || `Stats, drop rates, and where to find the ${item.name} in MouseHunt.`,
  };
}

/**
 * Structured data for a mouse or item.
 *
 * Deliberately `Thing` rather than `Product`: these aren't for sale, and marking
 * up a game mouse with an offer and a price is the kind of thing that earns a
 * manual action. `additionalProperty` carries the stats in a form a machine can
 * actually read, which is the honest version of the same goal.
 */
function property(name: string, value: string | number) {
  return { '@type': 'PropertyValue', name, value };
}

const SITE = 'https://mouse.rip';

export function mouseJsonLd(mouse: Mouse, attraction: AttractionRow[], slug: string) {
  const { description } = mouseSeo(mouse, attraction);
  const minluck = bestMinluck(mouse);
  const best = attraction[0];

  const properties = [
    property('Points', mouse.points),
    property('Gold', mouse.gold),
    mouse.group ? property('Group', mouse.group) : null,
    minluck ? property(`Minluck (${powerTypeLabel(minluck.type)})`, minluck.value) : null,
    best ? property('Best cheese', best.cheese) : null,
    best ? property('Best location', best.location) : null,
    best ? property('Attraction rate', `${(best.rate / 100).toFixed(2)}%`) : null,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: mouse.name,
    description,
    url: `${SITE}/mice/${slug}`,
    image: mouseImageUrl(slug),
    additionalType: 'https://schema.org/GameItem',
    isPartOf: { '@type': 'WebSite', name: 'mouse.rip', url: SITE },
    additionalProperty: properties,
  };
}

export function itemJsonLd(
  item: GameItem,
  context: { contents: ConvertibleRow[]; drops: ItemDrops },
  slug: string,
  image?: string,
) {
  const { description } = itemSeo(item, context);
  const stats = (item.has_stats && typeof item.has_stats === 'object' ? item.has_stats : null) as ItemStats | null;
  const bestDrop = context.drops.rows[0];

  const properties = [
    item.classification ? property('Type', item.classification) : null,
    stats?.has_power && stats.power ? property('Power', stats.power) : null,
    stats?.power_type ? property('Power type', powerTypeLabel(stats.power_type)) : null,
    stats?.has_luck && stats.luck ? property('Luck', stats.luck) : null,
    item.is_tradable ? property('Tradable', 'Yes') : null,
    context.contents.length > 0 ? property('Possible rewards', context.contents.length) : null,
    bestDrop ? property('Best drop rate', `${bestDrop.drop_pct}% (${bestDrop.location})`) : null,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: item.name,
    description,
    url: `${SITE}/items/${slug}`,
    ...(image ? { image } : {}),
    isPartOf: { '@type': 'WebSite', name: 'mouse.rip', url: SITE },
    additionalProperty: properties,
  };
}
