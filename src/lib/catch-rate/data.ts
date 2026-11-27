/**
 * The catch rate data as scripts/catch-rate-data.js writes it, and the lookups the engine works from.
 */

export const POWER_TYPE_ORDER = [
  'arcane',
  'draconic',
  'forgotten',
  'hydro',
  'law',
  'physical',
  'rift',
  'shadow',
  'tactical',
] as const;

export type PowerType = (typeof POWER_TYPE_ORDER)[number] | 'parental';

/** [type, name, powerType, power, bonus %, attraction %, luck, freshness] */
type ItemRow = [string, string, string, number, number, number, number, number];

export interface RawCatchRateData {
  locations: { id: string; name: string }[];
  stages: string[];
  cheeses: { type: string; name: string }[];
  populationCharms: string[];
  /** [location, stage, cheese, charm, source (0 MHCT, 1 MH-Tools), sample, then mouse and rate pairs…] */
  populations: number[][];
  /** [type, name, power, effectiveness % per power type in POWER_TYPE_ORDER, then points, gold, and wisdom] */
  mice: (string | number)[][];
  weapons: ItemRow[];
  bases: ItemRow[];
  charms: ItemRow[];
  groups: Record<string, string[] | Record<string, string[]>>;
}

export interface Item {
  type: string;
  name: string;
  /** Weapons only. */
  powerType: string;
  power: number;
  /** Percent. */
  bonus: number;
  /** Percent. */
  attraction: number;
  luck: number;
  /** -6 (Uber Stale) to 6 (Uber Fresh). */
  freshness: number;
}

export interface Mouse {
  type: string;
  name: string;
  power: number;
  /** Effectiveness of each power type, in percent. */
  effectiveness: Partial<Record<PowerType, number>>;
  /** What one catch is worth. */
  points: number;
  gold: number;
  wisdom: number;
}

export interface Population {
  location: string;
  stage: string;
  cheese: string;
  /** '-' for no particular charm. */
  charm: string;
  source: 'mhct' | 'mh-tools';
  /** Hunts behind the rates; 0 when the source doesn't say. */
  sample: number;
  /** Mouse type and attraction rate in percent. */
  mice: { type: string; rate: number }[];
}

export interface Catalog {
  locations: { id: string; name: string }[];
  locationName: Map<string, string>;
  cheeseName: Map<string, string>;
  populations: Population[];
  mice: Map<string, Mouse>;
  weapons: Map<string, Item>;
  bases: Map<string, Item>;
  charms: Map<string, Item>;
  groups: RawCatchRateData['groups'];
}

const toItem = ([type, name, powerType, power, bonus, attraction, luck, freshness]: ItemRow): Item => ({
  type,
  name,
  powerType,
  power,
  bonus,
  attraction,
  luck,
  freshness,
});

export function buildCatalog(raw: RawCatchRateData): Catalog {
  const mice = new Map<string, Mouse>();
  for (const [type, name, power, ...effs] of raw.mice) {
    const effectiveness: Mouse['effectiveness'] = {};
    POWER_TYPE_ORDER.forEach((powerType, i) => {
      effectiveness[powerType] = Number(effs[i]) || 0;
    });
    const [points, gold, wisdom] = effs.slice(POWER_TYPE_ORDER.length).map((value) => Number(value) || 0);
    mice.set(String(type), {
      type: String(type),
      name: String(name),
      power: Number(power),
      effectiveness,
      points: points ?? 0,
      gold: gold ?? 0,
      wisdom: wisdom ?? 0,
    });
  }

  const populations = raw.populations.map(([location, stage, cheese, charm, source, sample, ...pairs]) => {
    const rates: Population['mice'] = [];
    for (let i = 0; i < pairs.length; i += 2) {
      rates.push({ type: String(raw.mice[pairs[i]][0]), rate: pairs[i + 1] / 100 });
    }
    return {
      location: raw.locations[location].id,
      stage: raw.stages[stage],
      cheese: raw.cheeses[cheese].type,
      charm: raw.populationCharms[charm],
      source: source === 0 ? ('mhct' as const) : ('mh-tools' as const),
      sample,
      mice: rates,
    };
  });

  return {
    locations: raw.locations,
    locationName: new Map(raw.locations.map((location) => [location.id, location.name])),
    cheeseName: new Map(raw.cheeses.map((cheese) => [cheese.type, cheese.name])),
    populations,
    mice,
    weapons: new Map(raw.weapons.map((row) => [row[0], toItem(row)])),
    bases: new Map(raw.bases.map((row) => [row[0], toItem(row)])),
    charms: new Map(raw.charms.map((row) => [row[0], toItem(row)])),
    groups: raw.groups,
  };
}

const groupCache = new WeakMap<Catalog, Map<string, Set<string>>>();

/** A mouse group from cre-mice-groups, flat or nested ("fort_rox.weremice"). Built once per catalog. */
export function group(catalog: Catalog, path: string): Set<string> {
  let cache = groupCache.get(catalog);
  if (!cache) {
    cache = new Map();
    groupCache.set(catalog, cache);
  }
  let members = cache.get(path);
  if (!members) {
    const [key, sub] = path.split('.');
    const value = catalog.groups[key];
    members = new Set(
      !value ? [] : Array.isArray(value) ? value : sub ? (value[sub] ?? []) : Object.values(value).flat(),
    );
    cache.set(path, members);
  }
  return members;
}
