/**
 * What the estimator's pickers offer for a location, and the setup as a URL.
 *
 * The URL is the way in for other tools: MouseHunt Improved (or a bookmarklet) can open
 * /catch-rate-estimator?location=…&weapon=… with the hunter's camp filled in. Every value is the game's own
 * type ("floating_law_upgraded_weapon"), so a link never depends on how a name is spelled.
 */

import type { Catalog } from './data';
import type { Extras, Setup } from './engine';

/** Iceberg stages come in a version for each of these bases; the stage picker shows one and the base picks. */
const BASE_STAGE_SUFFIX: Record<string, string> = {
  magnet_base: 'Magnet',
  hearthstone_base: 'Hearthstone',
  ultimate_iceberg_base: 'Ultimate Iceberg',
};
const SUFFIX = new RegExp(` \\((${Object.values(BASE_STAGE_SUFFIX).join('|')})\\)$`);

/** A location's stages as the picker shows them, in the data's order. '-' means the location has none. */
export function stagesFor(catalog: Catalog, location: string): string[] {
  const stages = new Set<string>();
  for (const population of catalog.populations) {
    if (population.location === location) stages.add(population.stage.replace(SUFFIX, ''));
  }
  return [...stages];
}

/** The stage the data has for the picked stage and base: "Bombing Run (Magnet)" with a Magnet Base. */
export function resolveStage(catalog: Catalog, location: string, stage: string, base: string): string {
  const suffix = BASE_STAGE_SUFFIX[base];
  if (!suffix) return stage;
  const variant = `${stage} (${suffix})`;
  return catalog.populations.some((population) => population.location === location && population.stage === variant)
    ? variant
    : stage;
}

/** Cheeses with attraction data at a location and stage, by name. */
export function cheesesFor(catalog: Catalog, location: string, stage: string): { type: string; name: string }[] {
  const types = new Set<string>();
  for (const population of catalog.populations) {
    if (population.location === location && population.stage.replace(SUFFIX, '') === stage) {
      types.add(population.cheese);
    }
  }
  return [...types]
    .map((type) => ({ type, name: catalog.cheeseName.get(type) ?? type }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Charms with their own attraction data for this location, stage and cheese. */
export function specialCharmsFor(catalog: Catalog, location: string, stage: string, cheese: string): Set<string> {
  return new Set(
    catalog.populations
      .filter(
        (population) =>
          population.location === location &&
          population.stage.replace(SUFFIX, '') === stage &&
          population.cheese === cheese &&
          population.charm !== '-',
      )
      .map((population) => population.charm),
  );
}

/** A setup with some fields changed, keeping the stage and cheese valid for the location. */
export function applyChanges(catalog: Catalog, setup: Setup, changes: Partial<Setup>): Setup {
  const next = { ...setup, ...changes };
  const stages = stagesFor(catalog, next.location);
  // A new location starts at its first stage; a link that names no stage, or one the location lacks, does too.
  if ((changes.location !== undefined && changes.location !== setup.location) || !stages.includes(next.stage)) {
    next.stage = stages[0] ?? '-';
  }
  const available = cheesesFor(catalog, next.location, next.stage);
  if (!available.some((cheese) => cheese.type === next.cheese)) {
    next.cheese = mostHuntedCheese(catalog, next.location, next.stage) ?? available[0]?.type ?? '';
  }
  return next;
}

/**
 * The cheese with the most hunts recorded at a location and stage, as the one to start on.
 *
 * Alphabetical order would open the Mountain on Abominable Asiago and the Toxic Spill on a cheese hardly anyone
 * arms. A cheese hunted without any particular charm comes first, since one that only has data with a charm shows
 * nothing until the charm is picked too.
 */
function mostHuntedCheese(catalog: Catalog, location: string, stage: string): string | undefined {
  let best: Catalog['populations'][number] | undefined;
  for (const population of catalog.populations) {
    if (population.location !== location || population.stage.replace(SUFFIX, '') !== stage) continue;
    const plain = Number(population.charm === '-');
    const bestPlain = Number(best?.charm === '-');
    if (!best || plain > bestPlain || (plain === bestPlain && population.sample > best.sample)) best = population;
  }
  return best?.cheese;
}

/** URL parameter for each extra, with how to read it back. */
const EXTRA_PARAMS: { key: keyof Extras; param: string; kind: 'number' | 'flag' | 'text' }[] = [
  { key: 'battery', param: 'battery', kind: 'number' },
  { key: 'ballista', param: 'ballista', kind: 'number' },
  { key: 'cannon', param: 'cannon', kind: 'number' },
  { key: 'amplifier', param: 'amp', kind: 'number' },
  { key: 'salt', param: 'salt', kind: 'number' },
  { key: 'umbraFloor', param: 'umbra', kind: 'number' },
  { key: 'golemType', param: 'golem_type', kind: 'text' },
  { key: 'golemCharge', param: 'golem_charge', kind: 'number' },
  { key: 'isleIdolSkin', param: 'isle_idol', kind: 'text' },
  { key: 'dentureToothless', param: 'toothless', kind: 'flag' },
  { key: 'acolyteCatches', param: 'acolytes', kind: 'number' },
  { key: 'zokorWidth', param: 'zokor_width', kind: 'number' },
  { key: 'zokorBossDefeated', param: 'zokor_boss', kind: 'flag' },
  { key: 'warpathGuards', param: 'guards', kind: 'flag' },
  { key: 'acolyteSand', param: 'sand', kind: 'flag' },
  { key: 'meteorWidth', param: 'meteor', kind: 'number' },
  { key: 'dragonsMight', param: 'dragons_might', kind: 'flag' },
];

export const EMPTY_SETUP: Setup = {
  location: '',
  stage: '-',
  cheese: '',
  charm: '',
  weapon: '',
  base: '',
  empowered: false,
  goldenShield: true,
  riftstalker: false,
  bonusPower: 0,
  bonusLuck: 0,
  extras: {},
};

const finite = (value: string | null): number | undefined => {
  if (value === null || value.trim() === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

/** A setup from URL parameters; anything missing or unreadable falls back to the empty setup. */
export function setupFromParams(params: URLSearchParams): Setup {
  const extras: Extras = {};
  for (const { key, param, kind } of EXTRA_PARAMS) {
    const value = params.get(param);
    if (value === null) continue;
    if (kind === 'flag') (extras as Record<string, unknown>)[key] = value === '1';
    else if (kind === 'number') {
      const number = finite(value);
      if (number !== undefined) (extras as Record<string, unknown>)[key] = number;
    } else (extras as Record<string, unknown>)[key] = value;
  }
  return {
    location: params.get('location') ?? '',
    stage: params.get('stage') ?? '-',
    cheese: params.get('cheese') ?? '',
    charm: params.get('charm') ?? '',
    weapon: params.get('weapon') ?? '',
    base: params.get('base') ?? '',
    empowered: params.get('empowered') === '1',
    goldenShield: params.get('gs') !== '0',
    riftstalker: params.get('codex') === '1',
    bonusPower: finite(params.get('bonus_power')) ?? 0,
    bonusLuck: finite(params.get('bonus_luck')) ?? 0,
    extras,
  };
}

/** What a saved setup says about its location, which a link to another location replaces. */
const PLACE_PARAMS = ['stage', 'cheese', 'empowered', 'target'];

/**
 * A link that names a place but no trap, such as a location page's, keeps the hunter's own setup: the saved one
 * with the link laid over it. The saved stage, cheese and target go when the link is for somewhere else.
 */
export function overlayOnSaved(saved: string, link: URLSearchParams): URLSearchParams {
  const merged = new URLSearchParams(saved);
  if (link.has('location') && link.get('location') !== merged.get('location')) {
    for (const param of PLACE_PARAMS) merged.delete(param);
  }
  for (const [param, value] of link) merged.set(param, value);
  return merged;
}

/**
 * A Best Setup link aimed at one mouse in the place it's best hunted, for that mouse's page. Undefined when the
 * catch rate data doesn't have the mouse there, so the page never links to a search that can't find it.
 *
 * The spot is named the way the attraction tables name it. `keep=1` asks the tool to lay the link over the
 * hunter's saved charm, shield and bonuses even though it names a cheese (see overlayOnSaved).
 */
export function bestSetupLinkFor(
  catalog: Catalog,
  mouse: string,
  spot: { location: string; stage?: string | null; cheese: string; charm?: string | null },
): string | undefined {
  const location = catalog.locations.find((entry) => entry.name === spot.location)?.id;
  const cheese = [...catalog.cheeseName].find(([, name]) => name === spot.cheese)?.[0];
  // A spot only names a charm when the mouse never comes without it, so the link has to arm it.
  const charm = spot.charm ? [...catalog.charms.values()].find((item) => item.name === spot.charm)?.type : '';
  if (!location || !cheese || charm === undefined) return undefined;

  const stage = spot.stage || '-';
  const attractsIt = catalog.populations.some(
    (population) =>
      population.location === location &&
      population.stage.replace(SUFFIX, '') === stage &&
      population.cheese === cheese &&
      population.charm === (charm || '-') &&
      population.mice.some((entry) => entry.type === mouse),
  );
  if (!attractsIt) return undefined;

  const params = new URLSearchParams({ location });
  if (stage !== '-') params.set('stage', stage);
  params.set('cheese', cheese);
  if (charm) params.set('charm', charm);
  params.set('target', mouse);
  params.set('keep', '1');
  return `/best-setup?${params.toString()}`;
}

/** URL parameters for a setup, leaving out what's empty or at its default so links stay short. */
export function setupToParams(setup: Setup): URLSearchParams {
  const params = new URLSearchParams();
  const set = (param: string, value: string | undefined) => {
    if (value) params.set(param, value);
  };
  set('location', setup.location);
  if (setup.stage !== '-') set('stage', setup.stage);
  set('cheese', setup.cheese);
  set('charm', setup.charm);
  set('weapon', setup.weapon);
  set('base', setup.base);
  if (setup.empowered) params.set('empowered', '1');
  if (!setup.goldenShield) params.set('gs', '0');
  if (setup.riftstalker) params.set('codex', '1');
  if (setup.bonusPower) params.set('bonus_power', String(setup.bonusPower));
  if (setup.bonusLuck) params.set('bonus_luck', String(setup.bonusLuck));
  for (const { key, param, kind } of EXTRA_PARAMS) {
    const value = setup.extras[key];
    if (value === undefined || value === '' || value === false) continue;
    params.set(param, kind === 'flag' ? '1' : String(value));
  }
  return params;
}
