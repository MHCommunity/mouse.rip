/**
 * Plans a treasure map: which setups (location, stage, cheese) attract the most of its mice.
 *
 * Ported from the Plan tab in MouseHunt Improved's better-maps module, working from the
 * compact attraction table that scripts/update-data.js writes to map-planner.json.
 */

import { locationImageUrl } from '@/lib/image-urls';

/** map-planner.json: name tables, and per mouse id, rows of [location, stage, cheese, rate, hunts, charm?]. */
export interface PlannerData {
  locations: string[];
  stages: string[];
  cheeses: string[];
  charms: string[];
  mice: Record<string, [number, number, number, number, number, number?][]>;
}

export interface PlanMouse {
  id: number;
  name: string;
  type: string;
}

export interface Place {
  /** The site's location page, when it has one. */
  href?: string;
  image?: string;
  /** An event area or one that isn't open any more: only used when a mouse has nowhere else. */
  event?: boolean;
}

export interface Row {
  location: string;
  stage: string;
  cheese: string;
  charm: string;
  /** Percent. */
  rate: number;
  hunts: number;
}

export interface SetupMouse {
  mouse: PlanMouse;
  rate: number;
  hunts: number;
  /** The only location this mouse can be planned at. */
  onlyHere: boolean;
}

export interface Setup {
  key: string;
  location: string;
  stage: string;
  cheese: string;
  mice: SetupMouse[];
  /** Sum of the listed mice's rates: the chance one hunt attracts any of them. */
  raw: number;
  /** The same with each mouse capped, so one easy mouse doesn't carry a setup. */
  capped: number;
  hunts: number;
  /** Other stages or cheeses at the same location that attract the same mice. */
  alternatives: Setup[];
}

export interface Plan {
  setups: Setup[];
  /** Mice that some setup attracts every hunt. */
  guaranteed: (Row & { mouse: PlanMouse })[];
  /** Mice with no setup at or above RATE_FLOOR; best known setup attached. */
  hard: (Row & { mouse: PlanMouse })[];
  noData: PlanMouse[];
  /** Each planned mouse's usable setups, best first. */
  rowsByMouse: Map<number, Row[]>;
}

export type SortKey = 'best' | 'mice' | 'hunts';

export const SORTS: Record<SortKey, { label: string; title: string }> = {
  best: {
    label: 'Best overall',
    title: 'Total attraction, with each mouse capped so one easy mouse doesn’t dominate.',
  },
  mice: { label: 'Most mice', title: 'Setups that attract the most of your mice first.' },
  hunts: { label: 'Quickest to clear', title: 'Fewest expected hunts to attract every mouse listed for the setup.' },
};

/** A setup only counts for a mouse at or above this rate. */
export const RATE_FLOOR = 5;
/** A mouse adds at most this much to a setup's "best overall" score. */
const RATE_CAP = 33;
/** At or above this anywhere, a mouse is a guaranteed attraction rather than something to plan around. */
const GUARANTEED_RATE = 99;
/** MHCT setups with fewer hunts are only used when a mouse has nothing better sampled. */
export const MIN_HUNTS = 250;

/** MHCT logs these areas under their own names; they share a location page here. */
export const LOCATION_ALIASES: Record<string, string> = {
  'Twisted Garden': 'Living Garden',
  'Cursed City': 'Lost City',
  'Sand Crypts': 'Sand Dunes',
};

/** Each location the planner can suggest, resolved to its page. Anything without one is an event area. */
export function plannerPlaces(
  names: string[],
  regions: { locations: { id: string; name: string }[] }[],
): Record<string, Place> {
  const pages = new Map(regions.flatMap((region) => region.locations.map((l) => [l.name, l.id] as const)));
  const places: Record<string, Place> = {};
  for (const name of names) {
    const id = pages.get(LOCATION_ALIASES[name] ?? name);
    places[name] = id ? { href: `/locations/${id}`, image: locationImageUrl(id) } : { event: true };
  }
  return places;
}

export function rowsForMouse(data: PlannerData, id: number): Row[] {
  return (data.mice[id] ?? []).map(([location, stage, cheese, rate, hunts, charm]) => ({
    location: data.locations[location],
    stage: data.stages[stage] ?? '',
    cheese: data.cheeses[cheese],
    charm: charm === undefined ? '' : (data.charms[charm] ?? ''),
    rate: rate / 100,
    hunts,
  }));
}

/**
 * Expected hunts to attract every mouse in a setup at least once, ignoring catch rate.
 *
 * A hunt attracts at most one mouse, so E[T] = sum over k of P(T > k), where
 * P(T > k) = 1 - product(1 - (1 - p_i)^k).
 */
export function expectedHuntsToClear(rates: number[]): number {
  if (rates.length === 0) return 0;
  const missChance = rates.map(() => 1);
  let expected = 0;
  for (let hunt = 0; hunt < 10_000; hunt++) {
    let allSeen = 1;
    for (const chance of missChance) allSeen *= 1 - chance;
    const notDone = 1 - allSeen;
    expected += notDone;
    if (notDone < 0.0001) break;
    rates.forEach((rate, index) => {
      missChance[index] *= 1 - rate;
    });
  }
  return expected;
}

export function buildPlan(mice: PlanMouse[], data: PlannerData, places: Record<string, Place>): Plan {
  const isEvent = (location: string) => places[location]?.event ?? !places[location];

  const setups = new Map<string, Setup>();
  const guaranteed: Plan['guaranteed'] = [];
  const hard: Plan['hard'] = [];
  const noData: PlanMouse[] = [];
  const rowsByMouse = new Map<number, Row[]>();
  const locationCount = new Map<number, number>();

  for (const mouse of mice) {
    const all = rowsForMouse(data, mouse.id);
    const permanent = all.filter((row) => !isEvent(row.location));
    const rows = permanent.length > 0 ? permanent : all;
    if (rows.length === 0) {
      noData.push(mouse);
      continue;
    }

    const best = rows.reduce((top, row) => (row.rate > top.rate ? row : top));
    if (best.rate >= GUARANTEED_RATE) {
      guaranteed.push({ mouse, ...best });
      continue;
    }

    const viable = rows.filter((row) => row.rate >= RATE_FLOOR);
    if (viable.length === 0) {
      hard.push({ mouse, ...best });
      continue;
    }

    const trusted = viable.filter((row) => row.hunts >= MIN_HUNTS);
    const usable = (trusted.length > 0 ? trusted : viable).sort((a, b) => b.rate - a.rate);
    rowsByMouse.set(mouse.id, usable);
    locationCount.set(mouse.id, new Set(usable.map((row) => row.location)).size);

    for (const row of usable) {
      const key = `${row.location}|${row.stage}|${row.cheese}`;
      let setup = setups.get(key);
      if (!setup) {
        setup = {
          key,
          location: row.location,
          stage: row.stage,
          cheese: row.cheese,
          mice: [],
          raw: 0,
          capped: 0,
          hunts: 0,
          alternatives: [],
        };
        setups.set(key, setup);
      }
      setup.mice.push({ mouse, rate: row.rate, hunts: row.hunts, onlyHere: false });
    }
  }

  for (const setup of setups.values()) {
    setup.mice.sort((a, b) => b.rate - a.rate);
    for (const entry of setup.mice) {
      entry.onlyHere = locationCount.get(entry.mouse.id) === 1;
      setup.raw += entry.rate;
      setup.capped += Math.min(entry.rate, RATE_CAP);
    }
    setup.hunts = expectedHuntsToClear(setup.mice.map((entry) => entry.rate / 100));
  }

  return { setups: [...setups.values()], guaranteed, hard, noData, rowsByMouse };
}

/** Best first by the chosen sort, with same-location variants that attract the same mice folded into one. */
export function rankSetups(setups: Setup[], sort: SortKey): Setup[] {
  const comparators: Record<SortKey, (a: Setup, b: Setup) => number> = {
    best: (a, b) => b.capped - a.capped || b.mice.length - a.mice.length,
    mice: (a, b) => b.mice.length - a.mice.length || a.hunts - b.hunts,
    hunts: (a, b) => a.hunts - b.hunts || b.mice.length - a.mice.length,
  };
  const sorted = [...setups].sort(comparators[sort]);

  const seen = new Map<string, Setup>();
  const ranked: Setup[] = [];
  for (const setup of sorted) {
    const key = `${setup.location}|${setup.mice
      .map((entry) => entry.mouse.id)
      .sort((a, b) => a - b)
      .join(',')}`;
    const primary = seen.get(key);
    if (primary) {
      primary.alternatives.push(setup);
      continue;
    }
    const copy = { ...setup, alternatives: [] };
    seen.set(key, copy);
    ranked.push(copy);
  }
  return ranked;
}

/** Lowercase, plain apostrophes, no punctuation or trailing "mouse", so pasted names match loosely. */
export function normalizeMouseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ mouse$/, '');
}

/**
 * Pick the mice out of pasted text: one name per line, or separated by commas or semicolons.
 * Bullets and numbering are ignored. Returns the matched mice in order and the lines that matched nothing.
 */
export function parseMice<T extends PlanMouse & { abbreviated_name?: string }>(
  text: string,
  mice: T[],
): { matched: T[]; unmatched: string[] } {
  const byName = new Map<string, T>();
  for (const mouse of mice) {
    byName.set(normalizeMouseName(mouse.name), mouse);
    if (mouse.abbreviated_name) byName.set(normalizeMouseName(mouse.abbreviated_name), mouse);
  }

  const matched: T[] = [];
  const unmatched: string[] = [];
  const seen = new Set<number>();
  for (const part of text.split(/[\n,;\t]+/)) {
    const cleaned = part.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim();
    if (!cleaned) continue;
    const mouse = byName.get(normalizeMouseName(cleaned));
    if (!mouse) {
      unmatched.push(cleaned);
      continue;
    }
    if (seen.has(mouse.id)) continue;
    seen.add(mouse.id);
    matched.push(mouse);
  }
  return { matched, unmatched };
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function formatHunts(hunts: number): string {
  if (hunts < 10) return `~${Math.max(1, Math.round(hunts))} hunts`;
  return `~${(Math.round(hunts / 5) * 5).toLocaleString('en-US')} hunts`;
}
