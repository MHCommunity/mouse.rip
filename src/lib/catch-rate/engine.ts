/**
 * The catch rate estimator's maths: trap totals from a setup, and each mouse's catch rate and minluck.
 *
 * Ported from tsitu's MH-Tools and MouseHunt Improved, rewritten as plain functions of the setup so nothing is
 * shared between calls. The catch formula itself is the community's (mmalks, 2020), with the 140% luck cap
 * HitGrab confirmed in May 2020.
 */

import { group, type Catalog, type Item, type Population } from './data';
import * as S from './special';

/** Location state that changes the numbers; each only matters in its own location. */
export interface Extras {
  /** Furoma Rift battery level, 0–10. */
  battery?: number;
  /** Fort Rox Ballista and Cannon levels, 0–3. */
  ballista?: number;
  cannon?: number;
  /** Zugzwang's Tower amplifier, 0–175 (percent). */
  amplifier?: number;
  /** Sand Crypts salt, 0–50. */
  salt?: number;
  /** Highest Umbra floor reached, for the Prestige and Hailstone Singularity bases. */
  umbraFloor?: number;
  /** The Golem Guardian Trap's skin power type, and its charge (0–100). */
  golemType?: string;
  golemCharge?: number;
  /** The Isle Idol's skin: '' for none, 'hydroplane' or 'stakeshooter'. */
  isleIdolSkin?: string;
  /** A Denture Base that has lost its teeth. */
  dentureToothless?: boolean;
  /** Acolyte catches, for Father Winter's Timepiece. */
  acolyteCatches?: number;
  /** Zokor: the Retired Minotaur's labyrinth width (percent), and whether the district boss is defeated. */
  zokorWidth?: number;
  zokorBossDefeated?: boolean;
  /** Fiery Warpath: guards still standing, which keeps the Warmonger and Artillery Commander safe. */
  warpathGuards?: boolean;
  /** Bristle Woods Rift: the Absolute Acolyte still has sand left. */
  acolyteSand?: boolean;
  /** Fort Rox: the Heart of the Meteor's remaining width (percent). */
  meteorWidth?: number;
  /** The Dragon's Might aura: 300% power bonus against dragons. */
  dragonsMight?: boolean;
}

export interface Setup {
  location: string;
  stage: string;
  cheese: string;
  /** Item type, or '' for no charm. */
  charm: string;
  weapon: string;
  base: string;
  /** Brie or SUPER|brie+ in its Empowered form. */
  empowered?: boolean;
  goldenShield: boolean;
  riftstalker: boolean;
  /** Power bonus (percent) and luck the game shows that the setup doesn't explain, such as auras. */
  bonusPower: number;
  bonusLuck: number;
  extras: Extras;
}

export interface Trap {
  power: number;
  luck: number;
  /** Attraction bonus, percent. */
  attraction: number;
  /** -6 (Uber Stale) to 6 (Uber Fresh). */
  freshness: number;
  powerType: string;
  /** Total power bonus, percent. */
  powerBonus: number;
}

/** What one mouse changes about the trap: the special cases that only apply against certain mice. */
interface Delta {
  power?: number;
  luck?: number;
  bonus?: number;
  riftPieces?: number;
}

const NONE: Item = { type: '', name: '', powerType: '', power: 0, bonus: 0, attraction: 0, luck: 0, freshness: 0 };

function weaponStats(setup: Setup, catalog: Catalog): Item | undefined {
  const weapon = catalog.weapons.get(setup.weapon);
  if (!weapon) return undefined;
  const { extras } = setup;

  if (weapon.type === S.GOLEM_GUARDIAN) {
    const skin = S.GOLEM_GUARDIAN_TYPES[extras.golemType ?? ''] ?? S.GOLEM_GUARDIAN_TYPES.arcane;
    // Starts at 2,500 power, 5% bonus, 5% attraction and 3 luck, and charges up to the skin's full stats.
    const charge = Math.round(Math.min(100, Math.max(0, extras.golemCharge ?? 100)) * 10) / 1000;
    return {
      ...weapon,
      powerType: extras.golemType && S.GOLEM_GUARDIAN_TYPES[extras.golemType] ? extras.golemType : 'arcane',
      power: (skin.power - 2500) * charge + 2500,
      bonus: 10 * charge + 5,
      attraction: 15 * charge + 5,
      luck: Math.floor((skin.luck - 3) * charge + 3),
      freshness: 1,
    };
  }
  if (weapon.type === S.ISLE_IDOL && extras.isleIdolSkin && S.ISLE_IDOL_SKINS[extras.isleIdolSkin]) {
    return { ...weapon, ...S.ISLE_IDOL_SKINS[extras.isleIdolSkin] };
  }
  return weapon;
}

function baseStats(setup: Setup, catalog: Catalog): Item | undefined {
  const base = catalog.bases.get(setup.base);
  if (!base) return undefined;
  const { extras } = setup;

  if (S.PRESTIGE_BASES.has(base.type) && (extras.umbraFloor ?? 0) > 0) {
    const floor = Math.min(200, extras.umbraFloor ?? 0);
    return { ...base, power: 490 + floor * 20, luck: 5 + Math.floor(floor / 8) * 2 };
  }
  if (S.DENTURE_CHARGED[base.type] && !extras.dentureToothless) {
    return { ...base, ...S.DENTURE_CHARGED[base.type], freshness: 0 };
  }
  if (S.PRINTING_PRESS_BASES.has(base.type)) {
    const full = { ...base, ...S.PRINTING_PRESS };
    if (S.FOLKLORE_LOCATIONS.has(setup.location)) return full;
    const { power, bonus, attraction, luck } = S.PAPERLESS_PENALTY;
    return {
      ...full,
      power: full.power - power,
      bonus: full.bonus - bonus,
      attraction: full.attraction - attraction,
      luck: full.luck - luck,
    };
  }
  return base;
}

/** Charms whose stats depend on the rest of the setup (MH-Tools' calcSpecialCharms). */
function charmStats(setup: Setup, catalog: Catalog): Item {
  const charm = catalog.charms.get(setup.charm);
  if (!charm) return NONE;
  const add = (power: number, bonus: number, attraction: number, luck: number): Item => ({
    ...charm,
    power: charm.power + power,
    bonus: charm.bonus + bonus,
    attraction: charm.attraction + attraction,
    luck: charm.luck + luck,
  });

  switch (charm.type) {
    case 'champion_trinket': {
      const luck = { champions_gold_base: 4, challengers_silver_base: 3, competitors_bronze_base: 2 }[setup.base];
      return luck ? add(0, 0, 0, luck) : charm;
    }
    case 'growth_trinket':
      return ['soiled_base', 'living_grove_base'].includes(setup.base) ? add(100, 3, 5, 4) : charm;
    case 'wild_growth_trinket':
      return ['soiled_base', 'living_grove_base'].includes(setup.base) ? add(300, 8, 20, 9) : charm;
    case 'spellbook_trinket':
      return setup.base === 'spellbook_base' ? add(500, 8, 0, 0) : charm;
  }
  if (charm.type.includes('snowball_trinket') && S.FESTIVE_WEAPONS.has(setup.weapon)) return add(0, 20, 0, 0);
  if (charm.type.includes('spooky_trinket') && S.HALLOWEEN_WEAPONS.has(setup.weapon)) return add(0, 20, 0, 0);
  if (charm.type.includes('party_trinket') && S.BIRTHDAY_WEAPONS.has(setup.weapon)) return add(0, 20, 0, 0);
  return charm;
}

export function isRiftCharm(catalog: Catalog, charm: string): boolean {
  return S.RIFT_CHARMS.has(charm) || /rift/i.test(catalog.charms.get(charm)?.name ?? '');
}

function riftPieces(setup: Setup, catalog: Catalog): number {
  return (
    Number(S.RIFT_WEAPONS.has(setup.weapon)) +
    Number(S.RIFT_BASES.has(setup.base)) +
    Number(Boolean(setup.charm) && isRiftCharm(catalog, setup.charm))
  );
}

/** The trap's totals for a setup, or undefined until it has a weapon and a base. */
export function trapStats(setup: Setup, catalog: Catalog, delta: Delta = {}): Trap | undefined {
  const weapon = weaponStats(setup, catalog);
  const base = baseStats(setup, catalog);
  if (!weapon || !base) return undefined;
  const charm = charmStats(setup, catalog);
  const { location, stage, cheese, extras } = setup;

  let power = 0;
  let luck = 0;
  let attraction = 0;
  let shownBonus = 0;
  // Bonuses the game applies but doesn't show in the trap's power bonus.
  let hiddenBonus = 0;

  // Location effects (MH-Tools' locationSpecificEffects).
  if (location === 'claw_shot_city') {
    if (['slac_spring_weapon', 'slac_ii_sling_weapon'].includes(setup.weapon) && setup.base === 'claw_shot_base') {
      power += /cactus/.test(setup.charm) ? 2500 : 1000;
    }
  } else if (location === 'seasonal_garden') {
    if (setup.base === 'seasonal_base') shownBonus += 18;
    if (['hween_2011_upgraded_weapon', 'terrifying_spider_weapon'].includes(setup.weapon) && stage === 'Fall') {
      luck += 10;
    }
  } else if (location === 'iceberg' || location === 'slushy_shoreline') {
    const laser = {
      steam_laser_mk_i_weapon: [1750, 3],
      steam_laser_mk_ii_weapon: [1250, 2],
      steam_laser_mk_iii_weapon: [1500, 2],
    }[setup.weapon];
    if (laser) {
      power += laser[0];
      luck += laser[1];
    } else if (setup.weapon === 'winter_hunt_iceberg_weapon' && location === 'iceberg') {
      luck += 45;
    }
    // Deep Freeze, Ultimate Iceberg and Iceberg Boiler bases in the lairs, before hunt 250.
    if (
      /Icewing's Lair|Hidden Depths|The Deep Lair/.test(stage) &&
      ['deep_freeze_base', 'ultimate_iceberg_base', 'iceberg_boiler_base'].includes(setup.base)
    ) {
      power += 665;
      luck += 9;
    }
  } else if (location === 'train_station') {
    if (
      (setup.weapon === 'bandit_deflector_weapon' && stage.includes('Raider River')) ||
      (setup.weapon === 'engine_doubler_weapon' && stage.includes('Daredevil Canyon')) ||
      (setup.weapon === 'supply_grabber_weapon' && stage.includes('Supply Depot'))
    ) {
      power += 1500;
    }
  } else if (S.TRIBAL_LOCATIONS.has(location) || location === 'cape_clawed') {
    if (['tiki_base', 'tribal_base'].includes(setup.base)) luck += 6;
    if (
      (location === 'derr_dunes' && setup.charm === 'derr_power_trinket') ||
      (location === 'nerg_plains' && setup.charm === 'nerg_power_trinket') ||
      (location === 'elub_shore' && setup.charm === 'elub_power_trinket')
    ) {
      power += 1000;
      shownBonus += 10;
    }
  } else if (location === 'desert_warpath') {
    if (setup.charm === 'flamebane_trinket') hiddenBonus += 150;
    if (setup.weapon === 'warden_slayer_weapon' && (stage === 'Wave 4' || stage === 'Portal')) {
      power += 2500;
      shownBonus += 2500;
    }
  } else if (location === 'pollution_outbreak') {
    if (setup.base === 'washboard_base') {
      shownBonus += 5;
      luck += 5;
    }
    if (setup.charm === 'soap_trinket') {
      power += 5000;
      luck += 10;
    } else if (setup.charm === 'super_soap_trinket') {
      power += 8000;
      luck += 12;
    }
  } else if (location === 'jungle_of_dread') {
    if (setup.weapon === 'dreaded_totem_weapon') power += 8500;
    if (setup.charm === 'dreaded_trinket') shownBonus += 300;
  } else if (location === 'sunken_city') {
    if (setup.base === 'depth_charge_base' && stage !== 'Docked') power += 1000;
  } else if (location === 'town_of_digby') {
    if (cheese === 'limelight_cheese' && setup.charm === 'drilling_trinket') hiddenBonus += 30;
  } else if (location === 'fort_rox') {
    if (setup.charm === 'nightlight_trinket') shownBonus += S.NIGHTLIGHT_BONUS[stage] ?? 0;
  } else if (location === 'floating_islands' || location === 'sky_palace') {
    if (cheese === 'extra_rich_sky_cheese') {
      shownBonus += 20;
      luck += 5;
    }
  }
  if (cheese === 'fusion_fondue_cheese' && setup.charm === 'emp400_trinket') power += 25000;

  // Item pairings.
  if (weapon.powerType === 'physical' && setup.base === 'physical_enhancement_base') {
    shownBonus += 25;
  } else if (
    ['polluted_base', 'refined_pollutinum_base'].includes(setup.base) &&
    /^(super_|extreme_|ultimate_)?polluted_trinket$/.test(setup.charm)
  ) {
    luck +=
      { polluted_trinket: 4, super_polluted_trinket: 6, extreme_polluted_trinket: 10, ultimate_polluted_trinket: 15 }[
        setup.charm
      ] ?? 0;
  } else if (setup.base === 'snow_golem_base' && setup.weapon === S.GOLEM_GUARDIAN) {
    luck += 6;
  } else if (setup.base === 'chocolate_bar_base' && setup.charm === 'dark_chocolate_trinket') {
    shownBonus += 20;
  } else if (setup.weapon === 'chrono_gwh_weapon') {
    power += (extras.acolyteCatches ?? 0) * 2000;
  }

  // The Rift set, doubled by the Riftstalker Codex.
  const pieces = riftPieces(setup, catalog) + (delta.riftPieces ?? 0);
  const riftMultiplier = setup.riftstalker ? 2 : 1;
  if (pieces >= 2) shownBonus += 20 * riftMultiplier;
  if (pieces >= 3) luck += 5 * riftMultiplier;

  if (location === 'rift_furoma') {
    const [batteryPower, batteryLuck] = S.BATTERY[Math.min(10, Math.max(0, extras.battery ?? 0))];
    power += batteryPower;
    luck += batteryLuck;
  }

  // Pouring the Living Garden (or the Twisted Garden, in MH-Tools' naming).
  const poured = (location === 'desert_oasis' || location === 'twisted_garden') && stage === 'Poured';
  const pourBonus = poured ? 5 : 0;
  if (poured) luck += 5;

  const empowered = S.EMPOWERED_CHEESES.has(cheese) || (setup.empowered && S.EMPOWERABLE_CHEESES.has(cheese));
  const cheeseBonus = empowered ? 20 : 0;

  const amplifier = location === 'zugzwang_tower' ? (extras.amplifier ?? 100) / 100 : 1;
  const setupBonus = weapon.bonus + base.bonus + charm.bonus + (delta.bonus ?? 0);
  const totalBonus = setupBonus + shownBonus + hiddenBonus + cheeseBonus + setup.bonusPower;

  const rawPower = weapon.power + base.power + charm.power + power + (delta.power ?? 0);
  const totalPower = Math.ceil(
    rawPower * (1 + totalBonus / 100) * (1 + (pourBonus / 100) * (1 + setupBonus / 100)) * amplifier,
  );
  const rawLuck =
    weapon.luck + base.luck + charm.luck + (setup.goldenShield ? 7 : 0) + setup.bonusLuck + luck + (delta.luck ?? 0);

  // Power-type charms don't change the Isle Idol or the Golem Guardian.
  const keepsType = setup.weapon === S.ISLE_IDOL || setup.weapon === S.GOLEM_GUARDIAN;
  return {
    power: Math.max(0, totalPower),
    luck: Math.max(0, Math.floor(rawLuck * Math.min(1, amplifier))),
    attraction: Math.max(0, Math.min(100, weapon.attraction + base.attraction + charm.attraction + attraction)),
    freshness: Math.max(-6, Math.min(6, weapon.freshness + base.freshness + charm.freshness)),
    powerType: (!keepsType && S.POWER_TYPE_CHARMS[setup.charm]) || weapon.powerType,
    powerBonus: totalBonus,
  };
}

/**
 * The catch formula: (E·P + 2·⌊min(E, 1.4)·L⌋²) / (E·P + M), capped at 1. E is the power type's effectiveness
 * against the mouse, P and L the trap's power and luck, and M the mouse's power.
 */
export function catchRate(effectiveness: number, power: number, luck: number, mousePower: number): number {
  if (effectiveness <= 0) return 0;
  const denominator = effectiveness * power + mousePower;
  if (denominator <= 0) return 1;
  return Math.min(1, (effectiveness * power + 2 * Math.floor(Math.min(effectiveness, 1.4) * luck) ** 2) / denominator);
}

/** The least luck that catches the mouse every time with no power at all; undefined when it can't be caught. */
export function minluck(effectiveness: number, mousePower: number): number | undefined {
  if (effectiveness <= 0) return undefined;
  if (mousePower <= 0) return 0;
  const candidate = Math.ceil(Math.ceil(Math.sqrt(mousePower / 2)) / Math.min(effectiveness, 1.4));
  // Floating point can leave the estimate one short.
  return catchRate(effectiveness, 0, candidate, mousePower) < 1 ? candidate + 1 : candidate;
}

/** King Grub and King Scarab lose power with each salt in the Sand Crypts. */
export function saltedPower(mouseType: string, power: number, salt: number): number {
  const curve = S.SALT_CURVES[mouseType] ?? S.SALT_CURVES.default;
  let result = power;
  for (let i = 0; i < curve.thresholds.length - 1; i++) {
    const step = curve.thresholds[i + 1] - curve.thresholds[i];
    result -= Math.min(step, Math.max(0, salt - curve.thresholds[i])) * curve.perSalt[i];
  }
  return result;
}

/** The trap changes that only apply against this mouse. */
function deltaFor(setup: Setup, catalog: Catalog, mouseType: string): Delta {
  const delta: Delta = {};
  const add = (key: keyof Delta, value: number) => {
    delta[key] = (delta[key] ?? 0) + value;
  };

  if (setup.location === 'zugzwang_tower') {
    const technic = group(catalog, 'zugzwang_tower.technic');
    const mystic = group(catalog, 'zugzwang_tower.mystic');
    if (mouseType === 'tech_pawn' || mouseType === 'mystic_pawn') {
      const own = mouseType === 'tech_pawn' ? 'technic_low_weapon' : 'mystic_low_weapon';
      const other = mouseType === 'tech_pawn' ? 'mystic_low_weapon' : 'technic_low_weapon';
      if (setup.weapon === own) {
        add('power', 10920);
        add('luck', 51);
      } else if (setup.weapon === other) {
        add('power', -60);
        add('luck', -0.05);
      }
    } else if (technic.has(mouseType) || mystic.has(mouseType)) {
      const side = technic.has(mouseType) ? 'obvious_ambush_weapon' : 'blackstone_pass_weapon';
      const opposite = technic.has(mouseType) ? 'blackstone_pass_weapon' : 'obvious_ambush_weapon';
      if (setup.weapon === side) {
        add('power', 1800);
        add('luck', 6);
      } else if (setup.weapon === opposite) {
        add('power', -2400);
        add('luck', -9);
      }
    }
    // cre-mice-groups lists technic_rook, which isn't a mouse; any chess rook counts.
    if (setup.charm === 'rook_crumble_trinket' && mouseType.endsWith('_rook')) add('bonus', 300);
  }

  if (group(catalog, 'dragon').has(mouseType)) {
    add('bonus', S.DRAGONBANE_BONUS[setup.charm] ?? 0);
    if (setup.extras.dragonsMight) add('bonus', 300);
  }
  if (setup.charm === 'calming_trinket' && S.TAUNTING_MICE.has(mouseType) && riftPieces(setup, catalog) >= 1) {
    add('riftPieces', 1);
  }
  if (setup.location === 'desert_warpath') {
    const troops = S.WARPATH_CHARMS[setup.charm];
    if (troops && group(catalog, `fiery_warpath.${troops}`).has(mouseType)) add('bonus', 50);
  }
  return delta;
}

export interface MouseResult {
  type: string;
  name: string;
  /** Percent of hunts that attract this mouse, after the cheese and the trap's attraction bonus. */
  attraction: number;
  /** 0–1. */
  catchRate: number;
  /** Catches per 100 hunts. */
  catches: number;
  /** Undefined when this trap can't catch the mouse at all. */
  minluck?: number;
}

/** One mouse against the setup: its catch rate and minluck, with every special case applied. */
export function mouseCatch(
  setup: Setup,
  catalog: Catalog,
  trap: Trap,
  mouseType: string,
): { catchRate: number; minluck?: number } {
  const mouse = catalog.mice.get(mouseType);
  if (!mouse) return { catchRate: 0 };
  const { extras, location, stage } = setup;

  const delta = deltaFor(setup, catalog, mouseType);
  const against = Object.keys(delta).length > 0 ? (trapStats(setup, catalog, delta) ?? trap) : trap;
  let effectiveness = (mouse.effectiveness[against.powerType as keyof typeof mouse.effectiveness] ?? 0) / 100;
  let power = mouse.power;
  let guaranteed = false;

  // What the area does to the mouse itself (MouseHunt Improved's applyMouseEffects).
  if (location === 'ancient_city') {
    if (mouseType === 'retired_minotaur') power *= (extras.zokorWidth ?? 100) / 100;
    else if (extras.zokorBossDefeated && against.powerType === 'forgotten') effectiveness += 1;
  } else if (location === 'fort_rox') {
    // The stored power is with Ballista and Cannon at level 1, so without them these mice are twice as strong.
    const ballista = extras.ballista ?? 0;
    const cannon = extras.cannon ?? 0;
    if (
      (group(catalog, 'fort_rox.weremice').has(mouseType) && ballista === 0) ||
      (group(catalog, 'fort_rox.cosmic').has(mouseType) && cannon === 0)
    ) {
      power *= 2;
    }
    if ((mouseType === 'nightmancer' && ballista >= 3) || (mouseType === 'nightfire_wallbreak' && cannon >= 3)) {
      guaranteed = true;
    }
    if (mouseType === 'heart_of_the_meteor') power *= (extras.meteorWidth ?? 100) / 100;
  } else if (location === 'desert_warpath') {
    if (
      extras.warpathGuards &&
      ((mouseType === 'desert_boss' && stage === 'Wave 4') ||
        (mouseType === 'desert_artillery_commander' && stage === 'Portal'))
    ) {
      effectiveness = 0;
    }
  } else if (location === 'rift_bristle_woods') {
    if (mouseType === 'rift_acolyte' && extras.acolyteSand) effectiveness = 0;
  } else if (location === 'sand_crypts') {
    if (group(catalog, 'sand_dunes').has(mouseType) && (extras.salt ?? 0) > 0) {
      power = saltedPower(mouseType, power, extras.salt ?? 0);
    }
  }

  // Sure catches and sure misses, wherever they're hunted.
  if (mouseType === 'battering_ram_night' && setup.weapon === 'battering_ram_buster_weapon') guaranteed = true;
  if (mouseType === 'bounty_hunter' && setup.charm === 'sheriff_badge_trinket') guaranteed = true;
  if (setup.charm === 'ultimate_trinket') guaranteed = true;
  if (location === 'sunken_city' && setup.charm === 'ultimate_anchoring_trinket' && stage !== 'Docked')
    guaranteed = true;
  if (mouseType === 'library_boss' && setup.weapon !== 'zurreals_folly_weapon') effectiveness = 0;

  if (effectiveness <= 0) return { catchRate: 0, minluck: undefined };
  if (guaranteed) return { catchRate: 1, minluck: 0 };

  let rate = catchRate(effectiveness, against.power, against.luck, power);

  // Traps that catch some share of the time whatever the catch rate (MH-Tools' calcCRMods).
  const instant = (chance: number) => {
    rate += (1 - rate) * chance;
  };
  if (
    setup.weapon === 'zugzwang_ultimate_move_weapon' &&
    (location === 'zugzwang_tower' || location === 'seasonal_garden') &&
    (location !== 'zugzwang_tower' || (extras.amplifier ?? 100) > 0)
  ) {
    instant(0.5);
  }
  if (
    location === 'fort_rox' &&
    ((group(catalog, 'fort_rox.weremice').has(mouseType) && (extras.ballista ?? 0) >= 2) ||
      (group(catalog, 'fort_rox.cosmic').has(mouseType) && (extras.cannon ?? 0) >= 2))
  ) {
    instant(0.5);
  }
  if (S.ANNIVERSARY_WEAPONS.has(setup.weapon)) instant(0.1);
  if (setup.weapon === 'pirate_sleigh_weapon' && S.PIRATE_MICE.has(mouseType)) instant(0.33);

  return { catchRate: Math.min(1, rate), minluck: minluck(effectiveness, power) };
}

/** The population for a setup: the charm's own when there is one, otherwise the one for no particular charm. */
export function findPopulation(setup: Setup, catalog: Catalog): Population | undefined {
  const matches = catalog.populations.filter(
    (population) =>
      population.location === setup.location && population.stage === setup.stage && population.cheese === setup.cheese,
  );
  return (
    (setup.charm ? matches.find((population) => population.charm === setup.charm) : undefined) ??
    matches.find((population) => population.charm === '-')
  );
}

/** Share of hunts that attract a mouse at all: the cheese's own rate, raised by the trap's attraction bonus. */
export function attractionRate(cheese: string, trapAttraction: number): number {
  const base = S.CHEESE_BASE_ATTRACTION[cheese] ?? 1;
  return base + (trapAttraction / 100) * (1 - base);
}

export interface Estimate {
  trap: Trap;
  population: Population;
  /** Share of hunts that attract a mouse, 0–1. */
  attractionRate: number;
  mice: MouseResult[];
  overall: { attraction: number; catches: number; catchRate: number; minluck?: number };
}

/** Everything the estimator shows for a setup, or undefined until the setup is complete and has data. */
export function estimate(setup: Setup, catalog: Catalog): Estimate | undefined {
  const trap = trapStats(setup, catalog);
  const population = findPopulation(setup, catalog);
  if (!trap || !population) return undefined;

  const rate = attractionRate(setup.cheese, trap.attraction);
  const mice = population.mice.map(({ type, rate: share }): MouseResult => {
    const result = mouseCatch(setup, catalog, trap, type);
    const attraction = share * rate;
    return {
      type,
      name: catalog.mice.get(type)?.name ?? type,
      attraction,
      catchRate: result.catchRate,
      catches: attraction * result.catchRate,
      minluck: result.minluck,
    };
  });

  const attraction = mice.reduce((sum, mouse) => sum + mouse.attraction, 0);
  const catches = mice.reduce((sum, mouse) => sum + mouse.catches, 0);
  const minlucks = mice.map((mouse) => mouse.minluck);
  return {
    trap,
    population,
    attractionRate: rate,
    mice: mice.sort((a, b) => b.attraction - a.attraction),
    overall: {
      attraction,
      catches,
      catchRate: attraction > 0 ? catches / attraction : 0,
      minluck: minlucks.some((value) => value === undefined) ? undefined : Math.max(0, ...(minlucks as number[])),
    },
  };
}

/**
 * The extra power bonus and luck that make the setup's totals match what the game shows: auras, events and
 * anything else the estimator doesn't model. Undefined until the setup has a trap.
 */
export function matchShownTotals(
  setup: Setup,
  catalog: Catalog,
  shown: { power: number; luck: number },
): { bonusPower: number; bonusLuck: number } | undefined {
  const plain = trapStats({ ...setup, bonusPower: 0, bonusLuck: 0 }, catalog);
  if (!plain) return undefined;
  const bonusLuck = Math.round(shown.luck - plain.luck);

  // Power is rounded up after the bonus, so take the estimate and step to the smallest tenth that hits it.
  const perBonus = plain.power / (1 + plain.powerBonus / 100);
  const estimate = Math.round(((shown.power / perBonus - 1) * 100 - plain.powerBonus) * 10) / 10;
  const powerWith = (bonusPower: number) => trapStats({ ...setup, bonusPower, bonusLuck: 0 }, catalog)?.power;
  for (let step = -10; step <= 10; step++) {
    const candidate = Math.round((estimate + step / 10) * 10) / 10;
    if (powerWith(candidate) === shown.power) return { bonusPower: candidate, bonusLuck };
  }
  return { bonusPower: estimate, bonusLuck };
}
