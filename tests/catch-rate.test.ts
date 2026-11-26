import { describe, expect, test } from 'bun:test';

import raw from '@/data/generated/catch-rate.json';
import { buildCatalog, POWER_TYPE_ORDER, type RawCatchRateData } from '@/lib/catch-rate/data';
import {
  attractionRate,
  catchRate,
  estimate,
  findPopulation,
  matchShownTotals,
  minluck,
  mouseCatch,
  saltedPower,
  trapStats,
  type Setup,
} from '@/lib/catch-rate/engine';
import miceJson from '@/data/generated/mice.json';
import {
  EMPTY_SETUP,
  applyChanges,
  bestSetupLinkFor,
  cheesesFor,
  overlayOnSaved,
  resolveStage,
  setupFromParams,
  setupToParams,
  stagesFor,
} from '@/lib/catch-rate/options';

const catalog = buildCatalog(raw as unknown as RawCatchRateData);

/** A plain setup to change one thing at a time. */
const setup = (changes: Partial<Setup> = {}): Setup => ({
  location: 'meadow',
  stage: '-',
  cheese: 'cheddar_cheese',
  charm: '',
  weapon: 'floating_law_upgraded_weapon',
  base: 'rainbow_diamond_refractor_base',
  goldenShield: false,
  riftstalker: false,
  bonusPower: 0,
  bonusLuck: 0,
  extras: {},
  ...changes,
});
const trap = (changes: Partial<Setup> = {}) => {
  const stats = trapStats(setup(changes), catalog);
  if (!stats) throw new Error('no trap');
  return stats;
};
const against = (mouse: string, changes: Partial<Setup> = {}) =>
  mouseCatch(setup(changes), catalog, trap(changes), mouse);

describe('the catch formula', () => {
  test('power alone: equal trap and mouse power catches half the time', () => {
    expect(catchRate(1, 10_000, 0, 10_000)).toBe(0.5);
  });

  test('luck adds 2·L², with effectiveness capped at 140% for luck', () => {
    // E 2, luck 10: ⌊1.4 × 10⌋ = 14, so 2 × 14² = 392 on top of 2 × 1000.
    expect(catchRate(2, 1000, 10, 3000)).toBeCloseTo((2000 + 392) / (2000 + 3000), 10);
  });

  test('never more than certain, and nothing with no effectiveness', () => {
    expect(catchRate(1, 1, 1000, 10)).toBe(1);
    expect(catchRate(0, 50_000, 100, 10)).toBe(0);
  });
});

describe('minluck', () => {
  test('the least luck that guarantees a catch with no power', () => {
    // √(1900 / 2) = 30.8, so 31 luck: 2 × 31² = 1922 ≥ 1900.
    expect(minluck(1, 1900)).toBe(31);
    expect(catchRate(1, 0, 31, 1900)).toBe(1);
    expect(catchRate(1, 0, 30, 1900)).toBeLessThan(1);
  });

  test('stronger power types need less luck, up to the 140% cap', () => {
    expect(minluck(1.5, 1900)).toBe(minluck(1.4, 1900));
    expect(minluck(1.4, 1900)).toBeLessThan(minluck(1, 1900) ?? 0);
  });

  test('a mouse the power type can’t catch has no minluck', () => {
    expect(minluck(0, 1900)).toBeUndefined();
  });

  test('matches the minluck the site lists for nearly every mouse and power type', () => {
    let compared = 0;
    const differ: string[] = [];
    for (const mouse of miceJson as { type: string; minlucks?: Record<string, number> }[]) {
      const data = catalog.mice.get(mouse.type);
      if (!data || !mouse.minlucks) continue;
      for (const type of POWER_TYPE_ORDER) {
        const listed = mouse.minlucks[type];
        const eff = (data.effectiveness[type] ?? 0) / 100;
        if (!listed || eff <= 0) continue;
        compared++;
        if (minluck(eff, data.power) !== listed) differ.push(`${mouse.type}/${type}`);
      }
    }
    expect(compared).toBeGreaterThan(4000);
    // The listed minlucks come from a community sheet with a few hand-set special cases.
    expect(differ.length / compared).toBeLessThan(0.01);
  });
});

describe('trap totals', () => {
  test('a real setup matches the game: S.T.I.N.G.E.R., Rainbow Diamond Refractor, Ultimate Ancient Charm', () => {
    // The game showed 20,741 power, 83 luck, 73% attraction and Uber Fresh, with a 45% aura bonus and 6 aura luck.
    const stats = trap({ charm: 'ultimate_ancient_trinket', goldenShield: true, bonusPower: 45, bonusLuck: 6 });
    expect(stats.power).toBe(20_741);
    expect(stats.luck).toBe(83);
    expect(stats.attraction).toBe(73);
    expect(stats.freshness).toBe(6);
    expect(stats.powerType).toBe('law');
  });

  test('no trap until there is a weapon and a base', () => {
    expect(trapStats(setup({ weapon: '' }), catalog)).toBeUndefined();
    expect(trapStats(setup({ base: 'nope' }), catalog)).toBeUndefined();
  });

  test('the Golden Shield adds 7 luck', () => {
    expect(trap({ goldenShield: true }).luck - trap().luck).toBe(7);
  });

  test('two Rift pieces add 20% power bonus, three add 5 luck, and the Riftstalker Codex doubles both', () => {
    const rift = { weapon: 'rift_glacier_gatler_weapon', base: 'rift_base' };
    const two = trap(rift);
    const three = trap({ ...rift, charm: 'rift_furoma_energy_trinket' });
    const codex = trap({ ...rift, charm: 'rift_furoma_energy_trinket', riftstalker: true });
    const charmLuck = catalog.charms.get('rift_furoma_energy_trinket')?.luck ?? 0;
    const itemBonus = (catalog.weapons.get(rift.weapon)?.bonus ?? 0) + (catalog.bases.get(rift.base)?.bonus ?? 0);
    expect(two.powerBonus - itemBonus).toBe(20);
    // One piece on its own does nothing.
    const one = trap({ weapon: rift.weapon });
    expect(one.powerBonus).toBe(
      (catalog.weapons.get(rift.weapon)?.bonus ?? 0) +
        (catalog.bases.get('rainbow_diamond_refractor_base')?.bonus ?? 0),
    );
    expect(three.luck - two.luck - charmLuck).toBe(5);
    expect(codex.luck - three.luck).toBe(5);
    expect(codex.powerBonus - three.powerBonus).toBe(20);
  });

  test('power-type charms change the trap’s type, except on the Golem Guardian and Isle Idol', () => {
    expect(trap({ charm: 'shadow_trinket' }).powerType).toBe('shadow');
    expect(trap({ charm: 'nanny_trinket' }).powerType).toBe('parental');
    expect(trap({ weapon: 'isle_idol_weapon', charm: 'shadow_trinket' }).powerType).toBe(
      catalog.weapons.get('isle_idol_weapon')?.powerType ?? 'missing',
    );
  });

  test('Empowered Brie and SUPER|brie+ add 20% power bonus', () => {
    expect(trap({ cheese: 'toxic_super_brie_cheese' }).powerBonus - trap().powerBonus).toBe(20);
    expect(trap({ cheese: 'super_brie_cheese', empowered: true }).powerBonus - trap().powerBonus).toBe(20);
    expect(trap({ cheese: 'cheddar_cheese', empowered: true }).powerBonus).toBe(trap().powerBonus);
  });

  test('the Golem Guardian grows from 2,500 power to its skin’s full stats as it charges', () => {
    const empty = trap({ weapon: 'snow_golem_trap_weapon', extras: { golemType: 'hydro', golemCharge: 0 } });
    const full = trap({ weapon: 'snow_golem_trap_weapon', extras: { golemType: 'hydro', golemCharge: 100 } });
    expect(full.powerType).toBe('hydro');
    expect(full.power).toBeGreaterThan(empty.power);
    expect(trap({ weapon: 'snow_golem_trap_weapon', extras: { golemType: 'tactical' } }).powerType).toBe('tactical');
  });

  test('the Prestige Base grows with the highest Umbra floor', () => {
    const low = trap({ base: 'valour_rift_prestige_base', extras: { umbraFloor: 8 } });
    const high = trap({ base: 'valour_rift_prestige_base', extras: { umbraFloor: 80 } });
    expect(high.power).toBeGreaterThan(low.power);
    expect(high.luck - low.luck).toBe(2 * (Math.floor(80 / 8) - Math.floor(8 / 8)));
  });

  test('Printing Press Bases are full strength only in Folklore Forest', () => {
    const base = { base: 'folklore_printing_press_base' };
    expect(trap({ ...base, location: 'foreword_farm' }).luck - trap({ ...base, location: 'meadow' }).luck).toBe(47);
  });

  test('a charged Denture Base beats a toothless one', () => {
    const charged = trap({ base: 'denture_base' });
    const toothless = trap({ base: 'denture_base', extras: { dentureToothless: true } });
    expect(charged.power).toBeGreaterThan(toothless.power);
  });

  test('the Champion Charm gets more luck with a better Tournament Base', () => {
    const on = (base: string) => trap({ charm: 'champion_trinket', base }).luck - trap({ base }).luck;
    expect(on('champions_gold_base') - on('competitors_bronze_base')).toBe(2);
  });

  test('the Zugzwang’s Tower amplifier scales power fully but luck only downwards', () => {
    const zt = { location: 'zugzwang_tower', stage: 'Technic Pawn Pincher' };
    const full = trap({ ...zt, extras: { amplifier: 100 } });
    expect(trap({ ...zt, extras: { amplifier: 175 } }).power).toBe(
      Math.ceil((full.power * 175) / 100) || full.power * 1.75,
    );
    expect(trap({ ...zt, extras: { amplifier: 175 } }).luck).toBe(full.luck);
    expect(trap({ ...zt, extras: { amplifier: 50 } }).luck).toBe(Math.floor(full.luck / 2));
    // Anywhere else the amplifier does nothing.
    expect(trap({ extras: { amplifier: 50 } })).toEqual(trap());
  });

  test('the Furoma Rift battery adds power and luck', () => {
    const furoma = { location: 'rift_furoma', stage: 'Pagoda' };
    expect(trap({ ...furoma, extras: { battery: 10 } }).luck - trap(furoma).luck).toBe(100);
    expect(trap({ extras: { battery: 10 } })).toEqual(trap());
  });

  test('pouring the Living Garden adds 5 luck and a pour bonus', () => {
    const poured = trap({ location: 'desert_oasis', stage: 'Poured' });
    const dry = trap({ location: 'desert_oasis', stage: 'Not Poured' });
    expect(poured.luck - dry.luck).toBe(5);
    expect(poured.power).toBeGreaterThan(dry.power);
  });
});

describe('special cases against particular mice', () => {
  test('sure catches', () => {
    expect(against('meadow_mouse_that_does_not_exist').catchRate).toBe(0);
    expect(against('bounty_hunter', { charm: 'sheriff_badge_trinket' })).toEqual({ catchRate: 1, minluck: 0 });
    expect(against('white', { charm: 'ultimate_trinket' }).catchRate).toBe(1);
  });

  test('Zurreal can only be caught with Zurreal’s Folly', () => {
    expect(against('library_boss').catchRate).toBe(0);
  });

  test('a sure catch beats the power type, but not a mouse that can’t be caught at all', () => {
    // Dragons are immune to Law, but the Ultimate Charm catches them anyway.
    expect(against('dragon').catchRate).toBe(0);
    expect(against('dragon', { charm: 'ultimate_trinket' }).catchRate).toBe(1);
    expect(against('library_boss', { charm: 'ultimate_trinket' }).catchRate).toBe(0);
  });

  test('the Anniversary traps add a 10% chance to catch', () => {
    const plain = against('big_bad_burroughs', { weapon: 'acronym_weapon' });
    const anniversary = against('big_bad_burroughs', { weapon: 'anniversary_acronym_weapon' });
    expect(plain.catchRate).toBeGreaterThan(0);
    expect(plain.catchRate).toBeLessThan(1);
    expect(anniversary.catchRate).toBeGreaterThan(plain.catchRate);
  });

  test('Dragonbane charms add power bonus only against dragons', () => {
    const draconic = { weapon: 'queso_canyon_draconic_weapon' };
    const ultimate = { ...draconic, charm: 'ultimate_dragonbane_trinket' };
    expect(against('dragon', draconic).catchRate).toBeGreaterThan(0);
    expect(against('dragon', ultimate).catchRate).toBeGreaterThan(against('dragon', draconic).catchRate);
    // Not against anything else: a mouse that isn't a dragon gets the plain formula with the trap's own stats.
    const burroughs = catalog.mice.get('big_bad_burroughs');
    const withCharm = trap(ultimate);
    const eff = (burroughs?.effectiveness.draconic ?? 0) / 100;
    expect(against('big_bad_burroughs', ultimate).catchRate).toBe(
      catchRate(eff, withCharm.power, withCharm.luck, burroughs?.power ?? 0),
    );
  });

  test('King Grub loses power with salt in the Sand Crypts', () => {
    expect(saltedPower('king_grub', 1_000_000, 0)).toBe(1_000_000);
    expect(saltedPower('king_grub', 1_000_000, 6)).toBe(1_000_000 - 6 * 50_000);
    expect(saltedPower('king_scarab', 1_000_000, 35)).toBe(1_000_000 - 30 * 25_000 - 5 * 12_500);
    const crypts = { location: 'sand_crypts', stage: '-', cheese: 'graveblossom_cheese' };
    expect(against('king_grub', { ...crypts, extras: { salt: 30 } }).catchRate).toBeGreaterThanOrEqual(
      against('king_grub', crypts).catchRate,
    );
  });

  test('Fort Rox weremice are twice as strong without the Ballista, and a sure catch half the time from level 2', () => {
    const fort = { location: 'fort_rox', stage: 'Midnight', weapon: 'acronym_weapon' };
    const none = against('werehauler', { ...fort, extras: { ballista: 0 } });
    const one = against('werehauler', { ...fort, extras: { ballista: 1 } });
    const two = against('werehauler', { ...fort, extras: { ballista: 2 } });
    expect(one.catchRate).toBeGreaterThan(none.catchRate);
    expect(two.catchRate).toBeCloseTo(one.catchRate + (1 - one.catchRate) * 0.5, 10);
  });
});

describe('populations and attraction', () => {
  test('cheese attraction rises with the trap’s attraction bonus', () => {
    expect(attractionRate('cheddar_cheese', 0)).toBe(0.7);
    expect(attractionRate('cheddar_cheese', 100)).toBe(1);
    expect(attractionRate('gouda_cheese', 50)).toBeCloseTo(0.95, 10);
    expect(attractionRate('super_brie_cheese', 0)).toBe(1);
  });

  test('a charm’s own population is used when there is one', () => {
    const plain = findPopulation(setup({ location: 'meadow', cheese: 'cheddar_cheese' }), catalog);
    expect(plain?.charm).toBe('-');
    const special = catalog.populations.find((population) => population.charm !== '-');
    if (!special) throw new Error('no charm population');
    const found = findPopulation(
      setup({ location: special.location, stage: special.stage, cheese: special.cheese, charm: special.charm }),
      catalog,
    );
    expect(found).toBe(special);
  });

  test('each population’s attraction rates add up to 100%', () => {
    const off = catalog.populations.filter((population) => {
      const total = population.mice.reduce((sum, mouse) => sum + mouse.rate, 0);
      return Math.abs(total - 100) > 1.5;
    });
    expect(off.length / catalog.populations.length).toBeLessThan(0.02);
  });

  test('an estimate for the Meadow', () => {
    const result = estimate(setup(), catalog);
    expect(result).toBeDefined();
    if (!result) return;
    expect(result.attractionRate).toBeGreaterThan(0.7);
    expect(result.overall.attraction).toBeCloseTo(result.attractionRate * 100, 0);
    expect(result.overall.catches).toBeLessThanOrEqual(result.overall.attraction);
    for (const mouse of result.mice) {
      expect(mouse.catchRate).toBeGreaterThanOrEqual(0);
      expect(mouse.catchRate).toBeLessThanOrEqual(1);
      expect(mouse.catches).toBeCloseTo(mouse.attraction * mouse.catchRate, 10);
    }
  });

  test('no estimate without a population', () => {
    expect(estimate(setup({ cheese: 'no_such_cheese' }), catalog)).toBeUndefined();
  });
});

describe('matching the camp', () => {
  test('works out the aura bonuses from the power and luck the game shows', () => {
    const camp = setup({ charm: 'ultimate_ancient_trinket', goldenShield: true });
    expect(matchShownTotals(camp, catalog, { power: 20_741, luck: 83 })).toEqual({ bonusPower: 45, bonusLuck: 6 });
  });

  test('a setup that already matches needs nothing extra', () => {
    const camp = setup({ charm: 'ultimate_ancient_trinket' });
    const stats = trap({ charm: 'ultimate_ancient_trinket' });
    expect(matchShownTotals(camp, catalog, { power: stats.power, luck: stats.luck })).toEqual({
      bonusPower: 0,
      bonusLuck: 0,
    });
  });

  test('nothing to match without a trap', () => {
    expect(matchShownTotals(setup({ weapon: '' }), catalog, { power: 1000, luck: 10 })).toBeUndefined();
  });
});

describe('estimator options and links', () => {
  test('a setup survives the trip through a link', () => {
    const full = setup({
      location: 'fort_rox',
      stage: 'Midnight',
      cheese: 'crescent_cheese',
      charm: 'nightlight_trinket',
      goldenShield: false,
      empowered: false,
      riftstalker: true,
      bonusPower: 12.5,
      bonusLuck: 3,
      extras: { ballista: 2, cannon: 1, dragonsMight: true, golemType: 'hydro' },
    });
    expect(setupFromParams(setupToParams(full))).toEqual(full);
  });

  test('links leave out defaults, and an empty link is the empty setup', () => {
    expect(setupToParams(EMPTY_SETUP).toString()).toBe('');
    expect(setupFromParams(new URLSearchParams())).toEqual(EMPTY_SETUP);
  });

  test('a link that names only a place keeps the saved trap, shield and bonuses', () => {
    const saved =
      'location=meadow&cheese=cheddar_cheese&weapon=acronym_weapon&base=rift_base&charm=luck_trinket&gs=0&bonus_luck=5';
    const here = setupFromParams(overlayOnSaved(saved, new URLSearchParams('location=meadow')));
    expect(here).toMatchObject({ location: 'meadow', cheese: 'cheddar_cheese', weapon: 'acronym_weapon' });

    // Somewhere else: the trap comes along, the old location's stage and cheese don't.
    const moved = setupFromParams(overlayOnSaved(`${saved}&stage=Night`, new URLSearchParams('location=harbour')));
    expect(moved).toMatchObject({
      location: 'harbour',
      stage: '-',
      cheese: '',
      weapon: 'acronym_weapon',
      base: 'rift_base',
      charm: 'luck_trinket',
      goldenShield: false,
      bonusLuck: 5,
    });

    // What the link does say wins, and nothing saved is just the link.
    const named = setupFromParams(overlayOnSaved(saved, new URLSearchParams('location=harbour&cheese=brie_cheese')));
    expect(named.cheese).toBe('brie_cheese');
    expect(setupFromParams(overlayOnSaved('', new URLSearchParams('location=harbour')))).toEqual({
      ...EMPTY_SETUP,
      location: 'harbour',
    });
  });

  test('a mouse page links to a Best Setup search that can find the mouse, keeping the hunter’s settings', () => {
    const href = bestSetupLinkFor(catalog, 'glazed', {
      location: 'Ice Fortress',
      stage: null,
      cheese: 'Glazed Pecan Pecorino Cheese',
    });
    expect(href).toStartWith('/best-setup?location=winter_hunt_fortress&cheese=');
    expect(href).toEndWith('&target=glazed&keep=1');

    // The link's place, cheese and target go over what was saved; the shield and bonus stay.
    const merged = overlayOnSaved(
      'location=meadow&cheese=cheddar_cheese&gs=0&bonus_luck=5',
      new URLSearchParams(href!.split('?')[1]),
    );
    expect(merged.get('location')).toBe('winter_hunt_fortress');
    expect(merged.get('target')).toBe('glazed');
    expect(merged.get('gs')).toBe('0');
    expect(merged.get('bonus_luck')).toBe('5');
  });

  test('a mouse that only comes with a charm gets a link that arms it', () => {
    const scholar = [...catalog.charms.values()].find((charm) => charm.name === 'Scholar Charm')!;
    const zurreal = [...catalog.mice.values()].find((mouse) => mouse.name === 'Zurreal the Eternal')!;
    const withCharm = catalog.populations.find(
      (population) => population.charm === scholar.type && population.mice.some((entry) => entry.type === zurreal.type),
    )!;
    const href = bestSetupLinkFor(catalog, zurreal.type, {
      location: catalog.locationName.get(withCharm.location)!,
      stage: withCharm.stage === '-' ? null : withCharm.stage,
      cheese: catalog.cheeseName.get(withCharm.cheese)!,
      charm: 'Scholar Charm',
    });
    expect(href).toContain(`charm=${scholar.type}`);
  });

  test('no link when the catch rate data doesn’t have the mouse there', () => {
    const spot = { location: 'Meadow', stage: null, cheese: 'Cheddar Cheese' };
    expect(bestSetupLinkFor(catalog, 'glazed', spot)).toBeUndefined();
    expect(bestSetupLinkFor(catalog, 'glazed', { ...spot, location: 'Nowhere' })).toBeUndefined();
    expect(bestSetupLinkFor(catalog, 'glazed', { ...spot, charm: 'No Such Charm' })).toBeUndefined();
  });

  test('a location opens on the cheese most hunted there, not the first in the alphabet', () => {
    const pick = (location: string) => applyChanges(catalog, { ...EMPTY_SETUP }, { location });
    for (const location of ['mountain', 'meadow', 'fort_rox', 'pollution_outbreak']) {
      const setup = pick(location);
      const here = catalog.populations.filter(
        (population) =>
          population.location === location && population.stage === setup.stage && population.charm === '-',
      );
      const most = Math.max(...here.map((population) => population.sample));
      expect(here.find((population) => population.cheese === setup.cheese)?.sample, location).toBe(most);
    }
    expect(pick('mountain').cheese).not.toBe('abominable_asiago_cheese');
  });

  test('junk in a link falls back to defaults', () => {
    const parsed = setupFromParams(new URLSearchParams('bonus_power=abc&ballista=&gs=maybe&amp=12x'));
    expect(parsed.bonusPower).toBe(0);
    expect(parsed.extras.ballista).toBeUndefined();
    expect(parsed.extras.amplifier).toBeUndefined();
    expect(parsed.goldenShield).toBe(true);
  });

  test('Iceberg shows each stage once, and the base picks the version', () => {
    const stages = stagesFor(catalog, 'iceberg');
    expect(stages).toContain('Bombing Run');
    expect(stages.some((stage) => stage.includes('(Magnet)'))).toBe(false);
    expect(resolveStage(catalog, 'iceberg', 'Bombing Run', 'magnet_base')).toBe('Bombing Run (Magnet)');
    expect(resolveStage(catalog, 'iceberg', 'Bombing Run', 'rift_base')).toBe('Bombing Run');
    // A base with no version of this stage keeps the plain one.
    expect(resolveStage(catalog, 'iceberg', 'Brutal Bulwark', 'magnet_base')).toBe('Brutal Bulwark');
  });

  test('every location has cheeses for each of its stages', () => {
    for (const location of catalog.locations) {
      for (const stage of stagesFor(catalog, location.id)) {
        expect(cheesesFor(catalog, location.id, stage).length, `${location.id} ${stage}`).toBeGreaterThan(0);
      }
    }
  });
});
