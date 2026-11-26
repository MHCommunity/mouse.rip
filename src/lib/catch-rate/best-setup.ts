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
  /** For a target mouse: its catches per 100 hunts and catch rate. */
  target?: { catches: number; catchRate: number };
}

/** How many of the strongest pairs get each charm tried on them. */
const CHARM_TRIALS = 50;

function score(result: RankedSetup, goal: Goal): number {
  return goal.kind === 'mouse' ? (result.target?.catches ?? 0) : result.catches;
}

function evaluate(setup: Setup, catalog: Catalog, population: Population, goal: Goal): RankedSetup | undefined {
  const trap = trapStats(setup, catalog);
  if (!trap) return undefined;
  const rate = attractionRate(setup.cheese, trap.attraction);
  let attracted = 0;
  let caught = 0;
  let target: RankedSetup['target'];
  for (const mouse of population.mice) {
    const { catchRate } = mouseCatch(setup, catalog, trap, mouse.type);
    const attraction = mouse.rate * rate;
    attracted += attraction;
    caught += attraction * catchRate;
    if (goal.kind === 'mouse' && mouse.type === goal.mouse) target = { catches: attraction * catchRate, catchRate };
  }
  return {
    weapon: setup.weapon,
    base: setup.base,
    charm: setup.charm,
    trap,
    catches: caught,
    catchRate: attracted > 0 ? caught / attracted : 0,
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

  const rank = (a: RankedSetup, b: RankedSetup) => score(b, goal) - score(a, goal) || b.catches - a.catches;
  const results = new Map<string, RankedSetup>();
  const tryOne = (weapon: string, base: string, charm: string) => {
    const { stage, population } = resolve(base, charm);
    if (!population) return;
    const result = evaluate({ ...setup, weapon, base, charm, stage }, catalog, population, goal);
    if (result) results.set(`${weapon}|${base}|${charm}`, result);
  };

  for (const weapon of candidates.weapons) {
    for (const base of candidates.bases) tryOne(weapon, base, setup.charm);
  }
  if (candidates.charms.length > 0) {
    const strongest = [...results.values()].sort(rank).slice(0, CHARM_TRIALS);
    for (const pair of strongest) {
      for (const charm of candidates.charms) tryOne(pair.weapon, pair.base, charm);
    }
  }

  return [...results.values()].sort(rank).slice(0, limit);
}
