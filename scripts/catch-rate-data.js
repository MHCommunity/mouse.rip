/**
 * Builds src/data/generated/catch-rate.json: everything the catch rate estimator and Best Setup need, in one
 * compact file the browser loads when someone opens either tool.
 *
 * - Populations, from api.mouse.rip/attraction: which mice each location, stage, cheese and charm attracts.
 * - Mice: power and effectiveness against each power type.
 * - Weapons, bases and charms with their stats, from the game's item data.
 * - The mouse groups the special cases need (dragons, weremice, chess pieces…), from api.mouse.rip/cre-mice-groups.
 *
 * Names are stored once in lookup tables and the populations point into them by index.
 */

/** The game's cheese-effect names, as freshness steps from -6 to 6. */
export const FRESHNESS = {
  'Uber Stale': -6,
  'Ultimately Stale': -5,
  'Insanely Stale': -4,
  'Extremely Stale': -3,
  'Very Stale': -2,
  Stale: -1,
  'No Effect': 0,
  Fresh: 1,
  'Very Fresh': 2,
  'Extremely Fresh': 3,
  'Insanely Fresh': 4,
  'Ultimately Fresh': 5,
  'Uber Fresh': 6,
};

/** Power types in the order each mouse's effectiveness is stored. */
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
];

const percent = (fraction) => Math.round((fraction ?? 0) * 1000) / 10;

/** [type, name, powerType, power, bonus %, attraction %, luck, freshness] for a weapon, base or charm. */
function itemRow(item) {
  const stats = item.has_stats && typeof item.has_stats === 'object' ? item.has_stats : {};
  return [
    item.type,
    item.name,
    stats.power_type || '',
    stats.power ?? 0,
    percent(stats.power_bonus),
    percent(stats.attraction_bonus),
    stats.luck ?? 0,
    FRESHNESS[stats.cheese_effect] ?? 0,
  ];
}

const byName = (a, b) => a[1].localeCompare(b[1]);

export function buildCatchRateData({ attraction, mice, items, groups }) {
  const ofClass = (classification) =>
    items
      .filter((item) => item.classification === classification)
      .map(itemRow)
      .sort(byName);
  const weapons = ofClass('weapon');
  const bases = ofClass('base');
  const charms = ofClass('trinket');

  const locations = [];
  const stages = ['-'];
  const cheeses = [];
  const charmTypes = ['-'];
  const index = (list, value, key = (entry) => entry) => {
    let at = list.findIndex((entry) => key(entry) === value);
    if (at === -1) at = list.push(value) - 1;
    return at;
  };
  const locationIndex = new Map();
  const cheeseIndex = new Map();
  const mouseIndex = new Map(mice.map((mouse, i) => [mouse.type, i]));

  const populations = [];
  for (const record of attraction) {
    if (!locationIndex.has(record.location)) {
      locationIndex.set(record.location, locations.push({ id: record.location, name: record.location_name }) - 1);
    }
    if (!cheeseIndex.has(record.cheese)) {
      cheeseIndex.set(record.cheese, cheeses.push({ type: record.cheese, name: record.cheese_name }) - 1);
    }
    const row = [
      locationIndex.get(record.location),
      index(stages, record.stage || '-'),
      cheeseIndex.get(record.cheese),
      index(charmTypes, record.charm || '-'),
      record.source === 'mhct' ? 0 : 1,
      record.sample_size ?? 0,
    ];
    for (const mouse of record.mice) {
      const at = mouseIndex.get(mouse.type);
      if (at === undefined || !(mouse.rate > 0)) continue;
      row.push(at, Math.round(mouse.rate * 100));
    }
    if (row.length > 6) populations.push(row);
  }

  return {
    locations,
    stages,
    cheeses,
    // Charms a population is specific to, by type; '-' is no particular charm.
    populationCharms: charmTypes,
    populations,
    mice: mice.map((mouse) => {
      const eff = mouse.effectivenesses ?? {};
      return [mouse.type, mouse.name, eff.power ?? 0, ...POWER_TYPE_ORDER.map((type) => eff[type] ?? 0)];
    }),
    weapons,
    bases,
    charms,
    groups,
  };
}
