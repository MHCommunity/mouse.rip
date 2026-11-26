import { describe, expect, test } from 'bun:test';

import { MIN_SAMPLE, bestAttractionRow } from '@/lib/attraction';
import { itemImageUrl, locationImageUrl, mouseGroupImageUrl, mouseImageUrl, titleImageUrl } from '@/lib/image-urls';
import {
  POWER_TYPES,
  bestPowerTypes,
  descriptionToParagraphs,
  powerTypeLabel,
  powerTypeSetLabel,
} from '@/lib/power-types';
import { attractionStageName, formatCountdown, stageLabel, stagesAt, timerLocationHref } from '@/lib/timers';
import { ogCard, pageMetadata } from '@/seo';
import {
  cleanDescription,
  formatCompactNumber,
  formatGold,
  formatNumber,
  formatSb,
  isInternalPath,
  isOurUrl,
  titleCase,
} from '@/utils';
import type { AttractionRow } from '@/types';

describe('numbers', () => {
  test('formatNumber uses commas whatever the visitor’s locale', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(undefined as unknown as number)).toBe('0');
  });

  test('formatCompactNumber', () => {
    expect(formatCompactNumber(19_700)).toBe('19.7K');
    expect(formatCompactNumber(950)).toBe('950');
    expect(formatCompactNumber(2_500_000)).toBe('2.5M');
  });

  test('formatGold rounds to whole gold', () => {
    expect(formatGold(1234.6)).toBe('1,235');
  });

  test('formatSb keeps cents only under 100', () => {
    expect(formatSb(1234.4)).toBe('1,234');
    expect(formatSb(12.345)).toBe('12.35');
    expect(formatSb(100)).toBe('100');
  });
});

describe('text', () => {
  test('cleanDescription strips tags and the baked-in season countdown', () => {
    expect(cleanDescription('<b>Bold</b> text')).toBe('Bold text');
    expect(cleanDescription('Grows here. Current season: Winter\nChanging to Spring in 1 day')).toBe('Grows here.');
    expect(cleanDescription('')).toBe('');
  });

  test('titleCase', () => {
    expect(titleCase('torn_pages')).toBe('Torn Pages');
    expect(titleCase('bait')).toBe('Bait');
  });

  test('descriptionToParagraphs splits on breaks and drops tags and blank lines', () => {
    expect(descriptionToParagraphs('One<br />Two<br><br/><i>Three</i>\n\n')).toEqual(['One', 'Two', 'Three']);
    expect(descriptionToParagraphs(undefined)).toEqual([]);
  });
});

describe('links', () => {
  test('isInternalPath', () => {
    expect(isInternalPath('/guides/foo')).toBe(true);
    expect(isInternalPath('https://mouse.rip/guides')).toBe(false);
    expect(isInternalPath(undefined as unknown as string)).toBe(false);
  });

  test('isOurUrl counts mouse.rip but not its sibling services', () => {
    expect(isOurUrl('/mice')).toBe(true);
    expect(isOurUrl('https://mouse.rip/mice')).toBe(true);
    expect(isOurUrl('https://www.mouse.rip')).toBe(true);
    expect(isOurUrl('https://api.mouse.rip/mice')).toBe(false);
    expect(isOurUrl('https://example.com')).toBe(false);
    expect(isOurUrl('not a url')).toBe(false);
    expect(isOurUrl('')).toBe(false);
  });

  test('image URLs use dashes and the right folder', () => {
    expect(mouseImageUrl('abominable_snow')).toBe('https://i.mouse.rip/images/mice/thumbnail/abominable-snow.png');
    expect(mouseImageUrl('glazed', 'large')).toBe('https://i.mouse.rip/images/mice/large/glazed.png');
    expect(itemImageUrl('super_brie_cheese', 'trap')).toBe(
      'https://i.mouse.rip/images/items/trap/super-brie-cheese.png',
    );
    expect(mouseGroupImageUrl('event_mice')).toBe('https://i.mouse.rip/images/mice/groups/event-mice.jpg');
    expect(locationImageUrl('town_of_gnawnia')).toBe('https://i.mouse.rip/images/locations/town-of-gnawnia.png');
    expect(titleImageUrl('lord_lady')).toBe('https://i.mouse.rip/images/titles/lord-lady.png');
  });
});

describe('power types', () => {
  test('bestPowerTypes returns every type tied for the highest effectiveness', () => {
    expect(bestPowerTypes({ arcane: 100, shadow: 150, hydro: 150, power: 999 })).toEqual(['hydro', 'shadow']);
    expect(bestPowerTypes({ arcane: 0 })).toEqual([]);
    expect(bestPowerTypes(undefined)).toEqual([]);
  });

  test('powerTypeSetLabel only says Any when every type is there', () => {
    expect(powerTypeSetLabel([...POWER_TYPES])).toBe('Any');
    expect(powerTypeSetLabel(POWER_TYPES.filter((t) => t !== 'rift'))).toBe('All but Rift');
    expect(powerTypeSetLabel(POWER_TYPES.filter((t) => t !== 'rift' && t !== 'law'))).toBe('All but Law and Rift');
    expect(powerTypeSetLabel(['shadow', 'arcane'])).toBe('Arcane, Shadow');
    expect(powerTypeSetLabel(['rift'])).toBe('Rift');
  });

  test('powerTypeLabel', () => {
    expect(powerTypeLabel('draconic')).toBe('Draconic');
    expect(powerTypeLabel('something')).toBe('Something');
  });
});

describe('bestAttractionRow', () => {
  const row = (rate: number, extra: Partial<AttractionRow> = {}): AttractionRow =>
    ({
      location: 'Meadow',
      stage: null,
      cheese: 'Cheddar',
      charm: null,
      rate,
      total_hunts: 1000,
      ...extra,
    }) as AttractionRow;

  test('prefers the best rate without a charm', () => {
    const rows = [row(5000, { charm: 'Lucky Charm' }), row(2000), row(3000)];
    expect(bestAttractionRow(rows)?.rate).toBe(3000);
  });

  test('uses a charm when every row needs one', () => {
    expect(bestAttractionRow([row(5000, { charm: 'Lucky Charm' })])?.charm).toBe('Lucky Charm');
  });

  test(`skips rows from fewer than ${MIN_SAMPLE} hunts when there is something better sampled`, () => {
    expect(bestAttractionRow([row(9000, { total_hunts: 5 }), row(1000)])?.rate).toBe(1000);
    expect(bestAttractionRow([row(9000, { total_hunts: 5 })])?.rate).toBe(9000);
  });

  test('MH-Tools rows have no sample size and count as trusted', () => {
    expect(bestAttractionRow([row(4000, { total_hunts: null }), row(1000)])?.rate).toBe(4000);
  });

  test('no rows, no answer', () => {
    expect(bestAttractionRow([])).toBeUndefined();
  });
});

describe('timers', () => {
  const at = (iso: string) => Date.parse(iso);
  const timer = {
    id: 'pollution_outbreak',
    name: 'Toxic Spill',
    current: { name: 'Hero', starts_at: '2026-01-01T00:00:00Z', ends_at: '2026-01-01T10:00:00Z', note: 'rising' },
    upcoming: [
      { name: 'Knight', starts_at: '2026-01-01T10:00:00Z', ends_at: '2026-01-01T20:00:00Z' },
      { name: 'Lord', starts_at: '2026-01-01T20:00:00Z', ends_at: '2026-01-02T06:00:00Z' },
    ],
  };

  test('stagesAt finds the stage running now, even after the API’s current one has ended', () => {
    expect(stagesAt(timer, at('2026-01-01T05:00:00Z'))?.current.name).toBe('Hero');
    const later = stagesAt(timer, at('2026-01-01T12:00:00Z'));
    expect(later?.current.name).toBe('Knight');
    expect(later?.next.map((s) => s.name)).toEqual(['Lord']);
    expect(stagesAt(timer, at('2026-01-03T00:00:00Z'))).toBeNull();
  });

  test('formatCountdown', () => {
    expect(formatCountdown(-5000)).toBe('0m');
    expect(formatCountdown(42 * 60_000)).toBe('42m');
    expect(formatCountdown((15 * 60 + 3) * 60_000)).toBe('15h 3m');
    expect(formatCountdown((3 * 24 + 7) * 3_600_000)).toBe('3d 7h');
  });

  test('timerLocationHref maps the game’s id to the site’s page', () => {
    expect(timerLocationHref(timer)).toBe('/locations/toxic-spill');
    expect(timerLocationHref({ ...timer, id: 'seasonal_garden' })).toBe('/locations/seasonal-garden');
  });

  test('stage names', () => {
    expect(stageLabel(timer.current)).toBe('Hero (rising)');
    expect(stageLabel(timer.upcoming[0])).toBe('Knight');
    expect(attractionStageName('Mid Tide')).toBe('Medium Tide');
    expect(attractionStageName('Low Tide')).toBe('Low Tide');
  });
});

describe('page metadata', () => {
  test('fills in the canonical URL and both social cards', () => {
    const meta = pageMetadata({ title: 'Mice', description: 'All of them', path: '/mice' });
    expect(meta.alternates?.canonical).toBe('/mice');
    expect(meta.openGraph).toMatchObject({ title: 'Mice | mouse.rip', url: '/mice', description: 'All of them' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image', images: ['/og'] });
  });

  test('ogCard escapes its parameters', () => {
    const url = ogCard({ title: 'Ful’Mina & co', subtitle: 'a=b' });
    const params = new URL(url, 'https://mouse.rip').searchParams;
    expect(params.get('title')).toBe('Ful’Mina & co');
    expect(params.get('subtitle')).toBe('a=b');
    expect(params.has('eyebrow')).toBe(false);
  });
});
