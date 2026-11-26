import { describe, expect, test } from 'bun:test';

import raw from '@/data/generated/catch-rate.json';
import { bestSetups, shownScore, tiedForBest } from '@/lib/catch-rate/best-setup';
import { buildCatalog, type RawCatchRateData } from '@/lib/catch-rate/data';
import { estimate, type Setup } from '@/lib/catch-rate/engine';
import { EMPTY_SETUP } from '@/lib/catch-rate/options';

const catalog = buildCatalog(raw as unknown as RawCatchRateData);
const everything = { weapons: [...catalog.weapons.keys()], bases: [...catalog.bases.keys()], charms: [] };
const where = (changes: Partial<Setup>): Setup => ({ ...EMPTY_SETUP, ...changes });
const meadow = where({ location: 'meadow', cheese: 'cheddar_cheese' });

describe('bestSetups', () => {
  test('ranks every weapon and base pair, best first, and stops at the limit', () => {
    const goal = { kind: 'catches' } as const;
    const results = bestSetups(meadow, catalog, everything, goal, 25);
    expect(results).toHaveLength(25);
    // Ranked on the score as it's shown, to a tenth of a catch.
    for (let i = 1; i < results.length; i++) {
      expect(shownScore(results[i - 1], goal)).toBeGreaterThanOrEqual(shownScore(results[i], goal));
    }
  });

  test('setups level on the shown score go by what they have to spare, not by rounding in the data', () => {
    const goal = { kind: 'catches' } as const;
    const results = bestSetups(meadow, catalog, everything, goal);
    const tied = tiedForBest(results, goal);
    expect(tied).toBeGreaterThan(1);
    for (let i = 1; i < tied; i++) {
      const [above, below] = [results[i - 1], results[i]];
      expect(above.weakest).toBeGreaterThanOrEqual(below.weakest);
      if (above.weakest === below.weakest) expect(above.trap.luck).toBeGreaterThanOrEqual(below.trap.luck);
    }
    expect(tiedForBest([], goal)).toBe(0);
  });

  test('a charm is only listed where it beats the same trap without it, once per trap', () => {
    // Plenty of traps catch everything here on their own. Charms with their own attraction data used to edge
    // ahead of them on a 0.01 rounding difference and fill the list.
    const pond = where({ location: 'prologue_pond', cheese: 'clamembert_cheese' });
    const goal = { kind: 'catches' } as const;
    const candidates = { ...everything, charms: [...catalog.charms.keys()] };
    const results = bestSetups(pond, catalog, candidates, goal);
    expect(results[0].charm).toBe('');
    const plain = new Map(results.filter((r) => !r.charm).map((r) => [`${r.weapon}|${r.base}`, r]));
    const withCharm = results.filter((r) => r.charm);
    for (const result of withCharm) {
      const same = plain.get(`${result.weapon}|${result.base}`);
      if (same) expect(shownScore(result, goal)).toBeGreaterThan(shownScore(same, goal));
    }
    const traps = withCharm.map((r) => `${r.weapon}|${r.base}`);
    expect(new Set(traps).size).toBe(traps.length);
  });

  test('only uses the items it is given', () => {
    const owned = { weapons: ['acronym_weapon', 'floating_law_upgraded_weapon'], bases: ['rift_base'], charms: [] };
    const results = bestSetups(meadow, catalog, owned, { kind: 'catches' });
    expect(results).toHaveLength(2);
    expect(results.every((result) => owned.weapons.includes(result.weapon) && result.base === 'rift_base')).toBe(true);
  });

  test('agrees with the estimator for the setup it picks', () => {
    const [best] = bestSetups(meadow, catalog, everything, { kind: 'catches' });
    const check = estimate({ ...meadow, weapon: best.weapon, base: best.base }, catalog);
    expect(check?.overall.catches).toBeCloseTo(best.catches, 10);
  });

  test('aiming for one mouse picks a power type that can catch it', () => {
    const dracano = where({ location: 'dracano', cheese: 'inferno_havarti_cheese' });
    const [best] = bestSetups(dracano, catalog, everything, { kind: 'mouse', mouse: 'dragon' }, 5);
    expect(best.trap.powerType).toBe('draconic');
    expect(best.target?.catchRate).toBeGreaterThan(0);
  });

  test('trying charms finds a sure catch when the Ultimate Charm is on offer', () => {
    // Dragons are immune to Arcane, so without a sure catch this setup misses most of what it attracts.
    const dracano = where({ location: 'dracano', cheese: 'inferno_havarti_cheese' });
    const owned = { weapons: ['acronym_weapon'], bases: ['rift_base'], charms: ['ultimate_trinket', 'luck_trinket'] };
    const [best] = bestSetups(dracano, catalog, owned, { kind: 'catches' });
    expect(best.charm).toBe('ultimate_trinket');
    expect(best.catchRate).toBe(1);
  });

  test('on Iceberg each base is scored against its own stage’s mice', () => {
    const iceberg = where({ location: 'iceberg', stage: 'Bombing Run', cheese: 'gouda_cheese' });
    const owned = { weapons: ['acronym_weapon'], bases: ['magnet_base', 'rift_base'], charms: [] };
    const results = bestSetups(iceberg, catalog, owned, { kind: 'catches' });
    expect(results).toHaveLength(2);
    const magnet = results.find((result) => result.base === 'magnet_base');
    const check = estimate(
      { ...iceberg, stage: 'Bombing Run (Magnet)', weapon: 'acronym_weapon', base: 'magnet_base' },
      catalog,
    );
    expect(magnet?.catches).toBeCloseTo(check?.overall.catches ?? -1, 10);
  });

  test('no population, no results', () => {
    expect(bestSetups(where({ location: 'meadow', cheese: 'nope' }), catalog, everything, { kind: 'catches' })).toEqual(
      [],
    );
  });

  test('a full search is quick enough to run on every change', () => {
    const start = performance.now();
    bestSetups(where({ location: 'fort_rox', stage: 'Midnight', cheese: 'crescent_cheese' }), catalog, everything, {
      kind: 'catches',
    });
    expect(performance.now() - start).toBeLessThan(1000);
  });
});
