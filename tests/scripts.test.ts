import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

import attractionJson from '@/data/generated/mice-attraction.json';
import miceSearch from '@/data/generated/mice-search.json';
import { bestAttractionRow } from '@/lib/attraction';
import type { PlannerData } from '@/lib/map-plan';
import type { AttractionRow } from '@/types';
import { fileImageType, imageType } from '../scripts/image-signature.js';
import { parseCsv, sheetToEffects } from '../scripts/update-trap-effects.js';
import {
  bestSpot,
  buildMapPlanner,
  fetchPerEntity,
  isLocationLoot,
  requireArray,
  selectPreferredItemsByName,
  validateItemReferences,
  validateMinimumCoverage,
  withoutGlobalLoot,
} from '../scripts/update-data.js';

const attraction = attractionJson as unknown as Record<string, AttractionRow[]>;

describe('parseCsv', () => {
  test('quoted fields can hold commas, doubled quotes and line breaks', () => {
    expect(parseCsv('a,"b, c","say ""hi""","two\nlines"\r\nnext,row')).toEqual([
      ['a', 'b, c', 'say "hi"', 'two\nlines'],
      ['next', 'row'],
    ]);
  });

  test('a last line without a line break still counts', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  test('empty fields are kept', () => {
    expect(parseCsv(',x,\n')).toEqual([['', 'x', '']]);
  });
});

describe('sheetToEffects', () => {
  const header = ['Region', 'Location', 'Effect 1', 'Effect 2'];

  test('carries the region down to the rows below it', () => {
    const effects = sheetToEffects([
      header,
      ['Gnawnia', 'Meadow', 'Some Trap\nDoes a thing', ''],
      ['', 'Windmill', 'Other Base\nDoes another', ''],
    ]);
    expect(effects.map((e: { region: string; location: string }) => `${e.region}/${e.location}`)).toEqual([
      'Gnawnia/Meadow',
      'Gnawnia/Windmill',
    ]);
  });

  test('joins names that wrap with a slash, and tidies spacing', () => {
    const [location] = sheetToEffects([
      header,
      ['R', 'Place', '(Chrome) Stormwrought Ballista/\nDragon Slayer Cannon\nExtra   power ,  luck .', ''],
    ]);
    expect(location.effects).toEqual([
      { name: '(Chrome) Stormwrought Ballista/ Dragon Slayer Cannon', effect: 'Extra power, luck.' },
    ]);
  });

  test('applies the sheet fixes and drops its trailing notes', () => {
    const [location] = sheetToEffects([
      header,
      [
        'R',
        'Place',
        'Black Widow\nBlack Widow drops bonus loot',
        'Ultimate Chrome Base\nBig bonus ...and Everywhere things',
      ],
    ]);
    expect(location.effects).toEqual([
      { name: 'Black Widow Base', effect: 'Bonus loot from the Black Widow Mouse' },
      { name: 'Ultimate Chrome Base', effect: 'Big bonus' },
    ]);
  });

  test('skips rows without a location and cells without a name', () => {
    expect(sheetToEffects([header, ['R', '', 'Trap\nEffect', ''], ['R', 'Place', '   ', '']])).toEqual([
      { region: 'R', location: 'Place', effects: [] },
    ]);
  });
});

describe('update-data guards', () => {
  test('requireArray', () => {
    expect(requireArray([1], 'x')).toEqual([1]);
    expect(() => requireArray(null, 'mice')).toThrow('mice returned null; expected an array');
    expect(() => requireArray({}, 'mice')).toThrow('expected an array');
  });

  test('validateMinimumCoverage refuses a snapshot that shrank by more than a tenth', () => {
    expect(() => validateMinimumCoverage('mice', 95, 100)).not.toThrow();
    expect(() => validateMinimumCoverage('mice', 80, 100)).toThrow('refusing to replace the snapshot');
    expect(() => validateMinimumCoverage('mice', 0, 0)).toThrow();
  });

  test('validateItemReferences names the missing ids', () => {
    const known = new Set([1, 2, 3]);
    expect(() => validateItemReferences('drops', [1, '2', 3], known)).not.toThrow();
    expect(() => validateItemReferences('drops', [1, 9, 9], known)).toThrow('references 1 item IDs');
    expect(() => validateItemReferences('drops', ['x'], known)).toThrow('invalid item ID');
  });

  test('selectPreferredItemsByName keeps the convertible when two items share a name', () => {
    const picked = selectPreferredItemsByName([
      { id: 1, name: 'Box', classification: 'collectible' },
      { id: 2, name: 'Box', classification: 'convertible' },
      { id: 3, name: 'Box', classification: 'stat' },
      { id: 4, name: 'Key', classification: 'stat' },
    ]);
    expect(picked.get('Box').id).toBe(2);
    expect(picked.get('Key').id).toBe(4);
  });
});

describe('fetchPerEntity', () => {
  const respond = (status: number, body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));
  const quiet = { sleep: () => Promise.resolve() };

  test('collects rows per id, treats 404 as none, and decodes escaped names', async () => {
    const fetchImpl = (url: string) =>
      url.endsWith('/1') ? respond(200, [{ name: '&lt3 Gift Basket' }]) : respond(404, { error: 'none' });
    const originalLog = console.log;
    console.log = () => {};
    try {
      const results = await fetchPerEntity('test', [1, 2], (id: number) => `things/${id}`, {
        ...quiet,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(results).toEqual({ 1: [{ name: '<3 Gift Basket' }] });
    } finally {
      console.log = originalLog;
    }
  });

  test('retries a failure, then refuses to return a partial dataset', async () => {
    let calls = 0;
    const fetchImpl = () => {
      calls++;
      return respond(500, {});
    };
    await expect(
      fetchPerEntity('test', [7], (id: number) => `x/${id}`, {
        ...quiet,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow('refusing to write a partial dataset');
    expect(calls).toBe(3);
  });
});

describe('loot', () => {
  test('event loot is only location loot in its own event’s locations', () => {
    expect(isLocationLoot(823, 'meadow')).toBe(false); // Party Charm
    expect(isLocationLoot(3521, 'cinnamon hill')).toBe(true); // Festive Spirit at home
    expect(isLocationLoot(3521, 'meadow')).toBe(false);
    expect(isLocationLoot(1, 'meadow')).toBe(true);
  });

  test('withoutGlobalLoot drops what turns up in 40% or more of locations', () => {
    const loot = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`loc${i}`, [{ id: 99 }, ...(i < 3 ? [{ id: 5 }] : []), { id: 100 + i }]]),
    );
    const cleaned = withoutGlobalLoot(loot);
    expect(cleaned.loc0.map((row: { id: number }) => row.id)).toEqual([5, 100]);
    expect(cleaned.loc9.map((row: { id: number }) => row.id)).toEqual([109]);
  });
});

describe('best spot', () => {
  test('the search index and the mouse page pick the same place for every mouse', () => {
    const differ: string[] = [];
    for (const [id, rows] of Object.entries(attraction)) {
      const page = bestAttractionRow(rows);
      const index = bestSpot(rows);
      if (page?.rate !== index?.rate || page?.location !== index?.location || page?.cheese !== index?.cheese) {
        differ.push(id);
      }
    }
    expect(differ).toEqual([]);
  });

  test('the search index on disk is in step with the attraction data', () => {
    const stale = (miceSearch as { id: number; name: string; best?: { location: string; rate: number } }[]).filter(
      (mouse) => {
        const expected = bestSpot(attraction[mouse.id] ?? []);
        return expected?.location !== mouse.best?.location || expected?.rate !== mouse.best?.rate;
      },
    );
    expect(stale.map((mouse) => mouse.name)).toEqual([]);
  });
});

/** The script is JavaScript, so its return type is too loose to index; it writes map-planner.json's shape. */
const buildMapPlannerTyped = (attraction: Record<number, AttractionRow[]>) =>
  buildMapPlanner(attraction) as unknown as PlannerData;

describe('buildMapPlanner', () => {
  const row = (extra: Partial<AttractionRow>) =>
    ({
      location: 'Meadow',
      stage: null,
      cheese: 'Cheddar',
      charm: null,
      rate: 1000,
      total_hunts: 500,
      ...extra,
    }) as AttractionRow;

  test('keeps the best row per setup, without charms, and drops rates under 1%', () => {
    const planner = buildMapPlannerTyped({
      1: [
        row({ rate: 1000 }),
        row({ rate: 2000, total_hunts: 50 }),
        row({ rate: 9000, charm: 'Lucky Charm' }),
        row({ cheese: 'Brie', rate: 99 }),
        row({ location: 'Harbour', stage: 'Pirates', rate: 1500 }),
      ],
    });
    const rows = planner.mice[1].map(
      ([location, stage, cheese, rate, hunts]) =>
        `${planner.locations[location]}|${planner.stages[stage]}|${planner.cheeses[cheese]}|${rate}|${hunts}`,
    );
    expect(rows).toEqual(['Meadow||Cheddar|2000|50', 'Harbour|Pirates|Cheddar|1500|500']);
  });

  test('a mouse that needs a charm everywhere keeps its charm rows', () => {
    const planner = buildMapPlannerTyped({ 2: [row({ charm: 'Lucky Charm' })] });
    expect(planner.charms[planner.mice[2][0][5] ?? -1]).toBe('Lucky Charm');
  });

  test('a mouse with nothing usable is left out', () => {
    expect(buildMapPlannerTyped({ 3: [row({ rate: 50 })] }).mice).toEqual({});
  });
});

describe('image signatures', () => {
  test.each([
    ['png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]],
    ['jpeg', [0xff, 0xd8, 0xff, 0xe0, 0, 0]],
    ['gif', [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    ['webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]],
  ])('%p', (type, bytes) => {
    expect(imageType(Buffer.from(bytes))).toBe(type);
  });

  test('an HTML error page, an empty body or a cut-off header is not an image', () => {
    expect(imageType(Buffer.from('<!doctype html><title>404</title>'))).toBeNull();
    expect(imageType(Buffer.alloc(0))).toBeNull();
    expect(imageType(Buffer.from([0x89, 0x50]))).toBeNull();
    expect(imageType(null)).toBeNull();
  });

  test('the site’s own images are real images', () => {
    const dir = path.join(import.meta.dir, '../public/images');
    const files = fs
      .readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter((f) => /\.(png|jpe?g|gif|webp)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    expect(files.filter((f) => !fileImageType(path.join(dir, f)))).toEqual([]);
  });

  // The downloaded mirror isn't in the repository, so this only runs where `update:images` has been run.
  const mirror = path.join(import.meta.dir, '../static-mouse-rip/images');
  test.skipIf(!fs.existsSync(mirror))(
    'every image in the local mirror is a real image',
    () => {
      const files = fs
        .readdirSync(mirror, { recursive: true, encoding: 'utf8' })
        .filter((f) => /\.(png|jpe?g|gif|webp)$/.test(f));
      expect(files.filter((f) => !fileImageType(path.join(mirror, f))).slice(0, 20)).toEqual([]);
    },
    60_000,
  );
});
