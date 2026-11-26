import { describe, expect, test } from 'bun:test';

import plannerJson from '@/data/generated/map-planner.json';
import miceSearch from '@/data/generated/mice-search.json';
import {
  LOCATION_ALIASES,
  MIN_HUNTS,
  RATE_FLOOR,
  buildPlan,
  expectedHuntsToClear,
  formatHunts,
  formatRate,
  initialSetups,
  normalizeMouseName,
  parseMice,
  plannerPlaces,
  rankSetups,
  rowsForMouse,
  type PlanMouse,
  type PlannerData,
} from '@/lib/map-plan';
import { getLocations } from '@/lib/site-data';

const planner = plannerJson as unknown as PlannerData;
const allMice = miceSearch as (PlanMouse & { abbreviated_name?: string })[];
const places = plannerPlaces(planner.locations, getLocations());

/** A small planner table: rows are [location, stage, cheese, rate in hundredths, hunts, charm?]. */
function data(mice: PlannerData['mice']): PlannerData {
  return {
    locations: ['Meadow', 'Town of Gnawnia', 'Event Area'],
    stages: ['', 'Night'],
    cheeses: ['Cheddar', 'Brie', 'Gouda'],
    charms: ['', 'Lucky Charm'],
    mice,
  };
}
const testPlaces = { Meadow: { href: '/locations/meadow' }, 'Town of Gnawnia': { href: '/locations/town-of-gnawnia' } };
const mouse = (id: number, name = `Mouse ${id}`): PlanMouse => ({ id, name, type: `mouse_${id}` });

describe('normalizeMouseName', () => {
  test.each([
    ['Glazy Mouse', 'glazy'],
    ['  GLAZY  ', 'glazy'],
    ['Ful’Mina the Mountain Queen', "ful'mina the mountain queen"],
    ['M400', 'm400'],
    ['Mouse', 'mouse'],
    ['Black Widow, Mouse!', 'black widow'],
  ])('%p → %p', (input, expected) => {
    expect(normalizeMouseName(input)).toBe(expected);
  });
});

describe('parseMice', () => {
  const mice = [
    { ...mouse(1, 'Glazy Mouse'), abbreviated_name: 'Glazy' },
    { ...mouse(2, 'Abominable Snow Mouse'), abbreviated_name: 'Abominable Snow' },
    mouse(3, 'Zombie Mouse'),
  ];

  test('reads lines, commas, semicolons and tabs', () => {
    const { matched } = parseMice('Glazy\nAbominable Snow Mouse, Zombie;Glazy\tZombie', mice);
    expect(matched.map((m) => m.id)).toEqual([1, 2, 3]);
  });

  test('ignores bullets and numbering', () => {
    const { matched, unmatched } = parseMice('- Glazy\n* Zombie Mouse\n• Abominable Snow\n1. Glazy\n2) Zombie', mice);
    expect(matched.map((m) => m.id)).toEqual([1, 3, 2]);
    expect(unmatched).toEqual([]);
  });

  test('lists what it could not match, without the bullet', () => {
    const { matched, unmatched } = parseMice('- Not A Mouse\nGlazy\n\n   \n', mice);
    expect(matched.map((m) => m.id)).toEqual([1]);
    expect(unmatched).toEqual(['Not A Mouse']);
  });

  test('every mouse on the site can be pasted back by its full name', () => {
    const { matched, unmatched } = parseMice(allMice.map((m) => m.name).join('\n'), allMice);
    expect(unmatched).toEqual([]);
    expect(matched.length).toBe(allMice.length);
  });

  test('every mouse can be pasted back by its short name', () => {
    const named = allMice.filter((m) => m.abbreviated_name);
    const misses = named.filter((m) => parseMice(m.abbreviated_name ?? '', allMice).matched[0]?.id !== m.id);
    expect(misses.map((m) => `${m.abbreviated_name} → ${m.name}`)).toEqual([]);
  });

  test('no two mice normalise to the same name', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const m of allMice) {
      const key = normalizeMouseName(m.name);
      if (seen.has(key)) clashes.push(`${seen.get(key)} / ${m.name}`);
      seen.set(key, m.name);
    }
    expect(clashes).toEqual([]);
  });
});

describe('expectedHuntsToClear', () => {
  test('nothing to clear takes no hunts', () => {
    expect(expectedHuntsToClear([])).toBe(0);
  });

  test('one mouse is a geometric wait: 1 / p hunts', () => {
    expect(expectedHuntsToClear([0.5])).toBeCloseTo(2, 2);
    expect(expectedHuntsToClear([0.1])).toBeCloseTo(10, 1);
  });

  test('two mice at 50% each take three hunts on average', () => {
    // First hunt gets one of them; the other then takes 1 / 0.5 = 2 more.
    expect(expectedHuntsToClear([0.5, 0.5])).toBeCloseTo(3, 2);
  });

  test('n mice at the same rate p take H(n) / p hunts, the coupon collector answer', () => {
    const harmonic = (n: number) => Array.from({ length: n }, (_, i) => 1 / (i + 1)).reduce((a, b) => a + b, 0);
    expect(expectedHuntsToClear(Array(15).fill(0.06))).toBeCloseTo(harmonic(15) / 0.06, 2);
  });

  test('matches the exact answer by inclusion–exclusion over every subset of mice', () => {
    // E[T] = Σ over non-empty subsets S of (−1)^(|S|+1) / P(S), where P(S) is the chance a hunt attracts one of S.
    const exact = (rates: number[]) => {
      let sum = 0;
      for (let mask = 1; mask < 1 << rates.length; mask++) {
        const subset = rates.filter((_, i) => (mask >> i) & 1);
        sum += (subset.length % 2 === 1 ? 1 : -1) / subset.reduce((a, b) => a + b, 0);
      }
      return sum;
    };
    for (const rates of [
      [0.3, 0.2, 0.1, 0.05],
      [0.33, 0.33, 0.33],
      [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
      [0.9, 0.05],
      [0.12, 0.07, 0.25, 0.06, 0.09, 0.3],
    ]) {
      expect(expectedHuntsToClear(rates) / exact(rates)).toBeCloseTo(1, 4);
    }
  });

  test('a mouse that never turns up never clears', () => {
    expect(expectedHuntsToClear([0.2, 0])).toBe(Infinity);
  });

  test('a rarer mouse never makes a setup quicker', () => {
    expect(expectedHuntsToClear([0.3, 0.05])).toBeGreaterThan(expectedHuntsToClear([0.3, 0.1]));
    expect(expectedHuntsToClear([0.3, 0.1, 0.1])).toBeGreaterThan(expectedHuntsToClear([0.3, 0.1]));
  });
});

describe('rowsForMouse', () => {
  test('turns indexes back into names and the rate into a percentage', () => {
    const table = data({ 1: [[0, 1, 2, 1234, 500, 1]] });
    expect(rowsForMouse(table, 1)).toEqual([
      { location: 'Meadow', stage: 'Night', cheese: 'Gouda', charm: 'Lucky Charm', rate: 12.34, hunts: 500 },
    ]);
    expect(rowsForMouse(table, 2)).toEqual([]);
  });
});

describe('buildPlan', () => {
  test('groups mice that share a setup and scores it', () => {
    const table = data({
      1: [[0, 0, 0, 3000, 1000]],
      2: [
        [0, 0, 0, 2000, 1000],
        [1, 0, 1, 1000, 1000],
      ],
    });
    const plan = buildPlan([mouse(1), mouse(2)], table, testPlaces);
    const meadow = plan.setups.find((s) => s.location === 'Meadow');
    expect(meadow?.mice.map((m) => m.mouse.id)).toEqual([1, 2]);
    expect(meadow?.raw).toBe(50);
    expect(meadow?.mice.find((m) => m.mouse.id === 1)?.onlyHere).toBe(true);
    expect(meadow?.mice.find((m) => m.mouse.id === 2)?.onlyHere).toBe(false);
    expect(plan.setups).toHaveLength(2);
  });

  test('caps each mouse in the overall score so one easy mouse does not carry a setup', () => {
    const plan = buildPlan([mouse(1)], data({ 1: [[0, 0, 0, 9000, 1000]] }), testPlaces);
    expect(plan.setups[0].raw).toBe(90);
    expect(plan.setups[0].capped).toBe(33);
  });

  test('a mouse attracted every hunt somewhere is guaranteed, not planned', () => {
    const plan = buildPlan([mouse(1)], data({ 1: [[0, 0, 0, 9950, 1000]] }), testPlaces);
    expect(plan.guaranteed.map((g) => g.mouse.id)).toEqual([1]);
    expect(plan.setups).toEqual([]);
  });

  test(`a mouse under ${RATE_FLOOR}% everywhere is hard, with its best spot attached`, () => {
    const plan = buildPlan(
      [mouse(1)],
      data({
        1: [
          [0, 0, 0, 300, 1000],
          [1, 0, 0, 450, 1000],
        ],
      }),
      testPlaces,
    );
    expect(plan.hard).toHaveLength(1);
    expect(plan.hard[0].location).toBe('Town of Gnawnia');
    expect(plan.hard[0].rate).toBe(4.5);
  });

  test('a mouse with no rows has no data', () => {
    const plan = buildPlan([mouse(9)], data({}), testPlaces);
    expect(plan.noData.map((m) => m.id)).toEqual([9]);
  });

  test('event areas only count when a mouse is found nowhere else', () => {
    const both = data({
      1: [
        [2, 0, 0, 5000, 1000],
        [0, 0, 0, 1000, 1000],
      ],
    });
    expect(buildPlan([mouse(1)], both, testPlaces).setups.map((s) => s.location)).toEqual(['Meadow']);

    const eventOnly = data({ 1: [[2, 0, 0, 5000, 1000]] });
    expect(buildPlan([mouse(1)], eventOnly, testPlaces).setups.map((s) => s.location)).toEqual(['Event Area']);
  });

  test(`setups from fewer than ${MIN_HUNTS} hunts are used only when nothing better sampled exists`, () => {
    const mixed = data({
      1: [
        [0, 0, 0, 4000, MIN_HUNTS - 1],
        [1, 0, 0, 1000, MIN_HUNTS],
      ],
    });
    expect(buildPlan([mouse(1)], mixed, testPlaces).setups.map((s) => s.location)).toEqual(['Town of Gnawnia']);

    const thin = data({ 1: [[0, 0, 0, 4000, 10]] });
    expect(buildPlan([mouse(1)], thin, testPlaces).setups.map((s) => s.location)).toEqual(['Meadow']);
  });
});

describe('rankSetups', () => {
  const table = data({
    1: [
      [0, 0, 0, 2000, 1000],
      [0, 0, 1, 1900, 1000],
      [1, 0, 0, 1000, 1000],
    ],
    2: [
      [0, 0, 0, 1000, 1000],
      [0, 0, 1, 1200, 1000],
      [1, 0, 0, 3000, 1000],
    ],
    3: [[1, 0, 0, 600, 1000]],
  });
  const plan = buildPlan([mouse(1), mouse(2), mouse(3)], table, testPlaces);

  test('folds other cheeses at the same location that attract the same mice', () => {
    const ranked = rankSetups(plan.setups, 'best');
    const meadow = ranked.filter((s) => s.location === 'Meadow');
    expect(meadow).toHaveLength(1);
    expect(meadow[0].alternatives.map((a) => a.cheese)).toHaveLength(1);
  });

  test('most mice puts the setup with all three first', () => {
    expect(rankSetups(plan.setups, 'mice')[0].location).toBe('Town of Gnawnia');
  });

  test('quickest to clear is ordered by expected hunts', () => {
    const ranked = rankSetups(plan.setups, 'hunts');
    const hunts = ranked.map((s) => s.hunts);
    expect(hunts).toEqual([...hunts].sort((a, b) => a - b));
  });

  test('does not change the setups it was given', () => {
    rankSetups(plan.setups, 'best');
    expect(plan.setups.every((s) => s.alternatives.length === 0)).toBe(true);
  });
});

describe('formatting', () => {
  test('rates', () => {
    expect(formatRate(12.345)).toBe('12.3%');
    expect(formatRate(5)).toBe('5.0%');
  });

  test('hunts round to fives past ten, and never say zero', () => {
    expect(formatHunts(0.2)).toBe('~1 hunts');
    expect(formatHunts(7.4)).toBe('~7 hunts');
    expect(formatHunts(23)).toBe('~25 hunts');
    expect(formatHunts(1234)).toBe('~1,235 hunts');
  });
});

describe('the real planner data', () => {
  test('every row points inside its lookup tables', () => {
    const bad: string[] = [];
    for (const [id, rows] of Object.entries(planner.mice)) {
      for (const [location, stage, cheese, rate, hunts, charm] of rows) {
        if (!planner.locations[location] || planner.stages[stage] === undefined || !planner.cheeses[cheese]) {
          bad.push(id);
        }
        if (charm !== undefined && !planner.charms[charm]) bad.push(id);
        if (!(rate >= 100 && rate <= 10_000) || hunts < 0) bad.push(id);
      }
    }
    expect([...new Set(bad)]).toEqual([]);
  });

  test('every planner mouse is a mouse on the site', () => {
    const ids = new Set(allMice.map((m) => String(m.id)));
    expect(Object.keys(planner.mice).filter((id) => !ids.has(id))).toEqual([]);
  });

  test('most mice have planner rows', () => {
    expect(Object.keys(planner.mice).length).toBeGreaterThan(allMice.length * 0.9);
  });

  test('aliased locations point at real location pages', () => {
    const names = new Set(getLocations().flatMap((region) => region.locations.map((l) => l.name)));
    expect(Object.values(LOCATION_ALIASES).filter((name) => !names.has(name))).toEqual([]);
  });

  test('the permanent locations the planner suggests have pages', () => {
    const linked = Object.values(places).filter((place) => place.href).length;
    expect(linked).toBeGreaterThan(planner.locations.length * 0.6);
  });

  test('plans a real map', () => {
    const { matched, unmatched } = parseMice(
      ['Glazy', 'Abominable Snow', 'Zombie', 'Relic Hunter', 'Burglar', 'Bionic', 'Granite', 'Diamond'].join('\n'),
      allMice,
    );
    expect(unmatched).toEqual([]);
    const plan = buildPlan(matched, planner, places);
    const planned = new Set(plan.setups.flatMap((s) => s.mice.map((m) => m.mouse.id)));
    // Every mouse lands somewhere: a setup, guaranteed, hard, or no data.
    for (const m of matched) {
      const accounted =
        planned.has(m.id) ||
        plan.guaranteed.some((g) => g.mouse.id === m.id) ||
        plan.hard.some((h) => h.mouse.id === m.id) ||
        plan.noData.some((n) => n.id === m.id);
      expect(accounted).toBe(true);
    }
    const ranked = rankSetups(plan.setups, 'best');
    expect(ranked.length).toBeGreaterThan(0);
    for (const setup of ranked) {
      expect(setup.mice.every((m) => m.rate >= RATE_FLOOR)).toBe(true);
      expect(Number.isFinite(setup.hunts)).toBe(true);
    }
  });
});

describe('initialSetups', () => {
  test('shows the top setups plus the best one for any mouse they leave out', () => {
    const { matched } = parseMice(
      ['Glazy', 'Abominable Snow', 'Zombie', 'Burglar', 'Bionic', 'Granite', 'Diamond'].join('\n'),
      allMice,
    );
    const ranked = rankSetups(buildPlan(matched, planner, places).setups, 'best');
    const shown = initialSetups(ranked, 3);
    const covered = new Set(shown.flatMap((setup) => setup.mice.map((entry) => entry.mouse.id)));
    const planned = new Set(ranked.flatMap((setup) => setup.mice.map((entry) => entry.mouse.id)));
    expect([...planned].filter((id) => !covered.has(id))).toEqual([]);
    // The top three come first, in order, and nothing is added that covers no new mouse.
    expect(shown.slice(0, 3)).toEqual(ranked.slice(0, 3));
    expect(shown.length).toBeLessThan(ranked.length);
  });

  test('a short list is shown whole', () => {
    expect(initialSetups([], 20)).toEqual([]);
  });
});
