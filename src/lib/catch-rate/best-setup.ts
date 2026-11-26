/**
 * Best Setup: every weapon and base a hunter owns, ranked against a location's mice.
 *
 * Every weapon and base pair is tried with the chosen charm (or none). Trying every charm too would be millions
 * of setups, so, like MH-Tools, charms are only tried on the strongest pairs.
 */

import type { Catalog, Population } from './data';
import { attractionRate, findPopulation, mouseCatch, trapStats, type Setup, type Trap } from './engine';
import { resolveStage } from './options';

export type Goal = { kind: 'catches' } | { kind: 'mouse'; mouse: string };

export interface Candidates {
  weapons: string[];
  bases: string[];
  /** Charms to try on the strongest pairs; empty to keep the setup's own charm. */
  charms: string[];
}

export interface RankedSetup {
  weapon: string;
  base: string;
  /** '' for no charm. */
  charm: string;
  trap: Trap;
  /** Catches per 100 hunts of everything the setup attracts. */
  catches: number;
  /** Share of attracted mice caught, 0–1. */
  catchRate: number;
  /** The catch rate against the mouse it does worst against, 0–1: how much the setup has to spare. */
  weakest: number;
  /** For a target mouse: its catches per 100 hunts and catch rate. */
  target?: { catches: number; catchRate: number };
}

/** How many of the strongest pairs get each charm tried on them. */
const CHARM_TRIALS = 50;

function score(result: RankedSetup, goal: Goal): number {
  return goal.kind === 'mouse' ? (result.target?.catches ?? 0) : result.catches;
}

/**
 * A setup's score to the precision the results print it at: a tenth of a catch, or a hundredth for one mouse.
 *
 * Setups are ranked on this, not the full figure. Past what's shown, the differences are rounding in the attraction
 * data (a charm's own table of mice can sum to 100.01%), and ranking on them put those charms above the same trap
 * without one.
 */
export function shownScore(result: RankedSetup, goal: Goal): number {
  const places = goal.kind === 'mouse' ? 100 : 10;
  return Math.round(score(result, goal) * places) / places;
}

/** How many of the results, from the top, share the best score. */
export function tiedForBest(results: RankedSetup[], goal: Goal): number {
  if (results.length === 0) return 0;
  const best = shownScore(results[0], goal);
  const next = results.findIndex((result) => shownScore(result, goal) !== best);
  return next === -1 ? results.length : next;
}

function evaluate(setup: Setup, catalog: Catalog, population: Population, goal: Goal): RankedSetup | undefined {
  const trap = trapStats(setup, catalog);
  if (!trap) return undefined;
  const rate = attractionRate(setup.cheese, trap.attraction);
  let attracted = 0;
  let caught = 0;
  let weakest = 1;
  let target: RankedSetup['target'];
  for (const mouse of population.mice) {
    const { catchRate } = mouseCatch(setup, catalog, trap, mouse.type);
    const attraction = mouse.rate * rate;
    attracted += attraction;
    caught += attraction * catchRate;
    if (attraction > 0) weakest = Math.min(weakest, catchRate);
    if (goal.kind === 'mouse' && mouse.type === goal.mouse) target = { catches: attraction * catchRate, catchRate };
  }
  return {
    weapon: setup.weapon,
    base: setup.base,
    charm: setup.charm,
    trap,
    catches: caught,
    catchRate: attracted > 0 ? caught / attracted : 0,
    weakest,
    target,
  };
}

/** The best setups for a location, stage and cheese, best first. */
export function bestSetups(
  setup: Setup,
  catalog: Catalog,
  candidates: Candidates,
  goal: Goal,
  limit = 100,
): RankedSetup[] {
  // The population can depend on the charm, and on Iceberg on the base too (its Magnet and Hearthstone stages).
  const populations = new Map<string, Population | undefined>();
  const resolve = (base: string, charm: string) => {
    const stage = resolveStage(catalog, setup.location, setup.stage, base);
    const key = `${stage}|${charm}`;
    if (!populations.has(key)) populations.set(key, findPopulation({ ...setup, stage, charm }, catalog));
    return { stage, population: populations.get(key) };
  };

  const tenths = (value: number) => Math.round(value * 10);
  const rank = (a: RankedSetup, b: RankedSetup) =>
    shownScore(b, goal) - shownScore(a, goal) ||
    // Level on what's shown. The hunter's own charm (or none) comes before one the search added,
    Number(a.charm !== setup.charm) - Number(b.charm !== setup.charm) ||
    // then, aiming for one mouse, whichever catches more of everything else,
    (goal.kind === 'mouse' ? tenths(b.catches) - tenths(a.catches) : 0) ||
    // then the one with more to spare: its hardest mouse, its luck, its power.
    b.weakest - a.weakest ||
    b.trap.luck - a.trap.luck ||
    b.trap.power - a.trap.power;
  const results = new Map<string, RankedSetup>();
  const tryOne = (weapon: string, base: string, charm: string) => {
    const { stage, population } = resolve(base, charm);
    if (!population) return undefined;
    return evaluate({ ...setup, weapon, base, charm, stage }, catalog, population, goal);
  };

  for (const weapon of candidates.weapons) {
    for (const base of candidates.bases) {
      const result = tryOne(weapon, base, setup.charm);
      if (result) results.set(`${weapon}|${base}|${setup.charm}`, result);
    }
  }
  if (candidates.charms.length > 0) {
    const strongest = [...results.values()].sort(rank).slice(0, CHARM_TRIALS);
    for (const pair of strongest) {
      // Each trap is listed once more at most, with the charm that does most for it. A charm earns that place by
      // showing a better number than the same trap without it.
      let best: RankedSetup | undefined;
      for (const charm of candidates.charms) {
        if (charm === setup.charm) continue;
        const result = tryOne(pair.weapon, pair.base, charm);
        if (!result || shownScore(result, goal) <= shownScore(pair, goal)) continue;
        if (!best || rank(result, best) < 0) best = result;
      }
      if (best) results.set(`${best.weapon}|${best.base}|${best.charm}`, best);
    }
  }

  return [...results.values()].sort(rank).slice(0, limit);
}
