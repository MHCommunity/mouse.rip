import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  AttractionRow,
  ConvertibleRow,
  FoundInConvertible,
  GameItem,
  ItemDropper,
  LocationLootRow,
  MapRelation,
  MiceGroup,
  MiceRegion,
  Mouse,
  MouseMapRow,
} from '@/types';

// These datasets are large (multiple MB). We read them from disk at build time
// (pages are statically generated) instead of `import`-ing them, so they never
// get bundled into the Cloudflare runtime worker.
const DATA_DIR = path.join(process.cwd(), 'src/data/generated');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')) as T;
}

/** Work something out the first time it's asked for, then reuse it. */
function lazy<T>(load: () => T): () => T {
  let value: { current: T } | null = null;
  return () => (value ??= { current: load() }).current;
}

/**
 * When scripts/update-data.js last actually refreshed the game data. The sitemap
 * reports this as lastmod — a file mtime would be wrong (a CI clone stamps every
 * file with the checkout time), and a lastmod that always reads "just now"
 * teaches crawlers to ignore it.
 */
export function getDataUpdatedAt(): Date {
  const { updatedAt } = readJson<{ updatedAt: string }>('data-updated.json');
  return new Date(updatedAt);
}

export function mouseSlug(type: string): string {
  return type.replaceAll('_', '-');
}

export function itemSlug(type: string): string {
  return type.replaceAll('_', '-');
}

const getMice = lazy(() => readJson<Mouse[]>('mice.json'));
const getMiceById = lazy(() => new Map(getMice().map((mouse) => [mouse.id, mouse])));
const getMiceBySlug = lazy(() => new Map(getMice().map((mouse) => [mouseSlug(mouse.type), mouse])));

export function getAllMice(): Mouse[] {
  return getMice();
}

export function getMouseBySlug(slug: string): Mouse | undefined {
  return getMiceBySlug().get(slug);
}

function miceForIds(ids: number[]): Mouse[] {
  const byId = getMiceById();
  return ids.map((id) => byId.get(id)).filter((mouse): mouse is Mouse => Boolean(mouse));
}

const getGroups = lazy(() =>
  readJson<MiceGroup[]>('mice-groups.json').sort((a, b) => a.display_order - b.display_order),
);
const getGroupsBySlug = lazy(() => new Map(getGroups().map((group) => [group.id, group])));
const getGroupSlugsByName = lazy(() => new Map(getGroups().map((group) => [group.name, group.id])));

export function getAllMiceGroups(): MiceGroup[] {
  return getGroups();
}

export function getMiceGroupBySlug(slug: string): MiceGroup | undefined {
  return getGroupsBySlug().get(slug);
}

/** Map a mouse's `group` name to its group slug, for linking. */
export function groupSlugForName(name: string): string | undefined {
  return getGroupSlugsByName().get(name);
}

/** The mice in a group, in the group's listed order. */
export function getMiceForGroup(group: MiceGroup): Mouse[] {
  return miceForIds(group.mouse_ids);
}

const getRegionsByName = lazy(
  () => new Map(readJson<MiceRegion[]>('mice-regions.json').map((region) => [region.name.toLowerCase(), region])),
);

/** The mice in a hunting region, looked up by the region's display name. */
export function getMiceForRegionName(name: string): Mouse[] {
  const region = getRegionsByName().get(name.toLowerCase());
  return region ? miceForIds(region.mouse_ids) : [];
}

export interface MouseRanks {
  points: number;
  gold: number;
  wisdom: number;
  total: number;
}

const getRanks = lazy(() => {
  const mice = getMice();
  const ranks = new Map<number, MouseRanks>(
    mice.map((mouse) => [mouse.id, { points: 0, gold: 0, wisdom: 0, total: mice.length }]),
  );
  for (const key of ['points', 'gold', 'wisdom'] as const) {
    const sorted = [...mice].sort((a, b) => b[key] - a[key]);
    let rank = 0;
    let previous: number | null = null;
    sorted.forEach((mouse, index) => {
      if (mouse[key] !== previous) {
        rank = index + 1;
        previous = mouse[key];
      }
      ranks.get(mouse.id)![key] = rank;
    });
  }
  return ranks;
});

/** A mouse's 1-based rank among all mice by points, gold, and wisdom (ties share a rank). */
export function getMouseRanks(mouseId: number): MouseRanks | undefined {
  return getRanks().get(mouseId);
}

const getItems = lazy(() => readJson<GameItem[]>('game-items.json'));
const getItemsBySlug = lazy(() => new Map(getItems().map((item) => [itemSlug(item.type), item])));
const getItemSlugsById = lazy(() => new Map(getItems().map((item) => [item.id, itemSlug(item.type)])));

export function getAllGameItems(): GameItem[] {
  return getItems();
}

export function getGameItemBySlug(slug: string): GameItem | undefined {
  return getItemsBySlug().get(slug);
}

/** Resolve a MouseHunt item id to its item-page slug, if we have that item. */
export function itemSlugForId(id: number): string | undefined {
  return getItemSlugsById().get(id);
}

const getMapRelations = lazy(() => readJson<MapRelation[]>('map-relations.json'));

/**
 * Scroll-case → map → treasure-chest relations touching a given item, whether
 * that item is the scroll case or one of the chests.
 */
export function getMapRelationsForItem(itemId: number): MapRelation[] {
  return getMapRelations().filter(
    (relation) => relation.scrollCase.id === itemId || relation.chests.some((chest) => chest.id === itemId),
  );
}

const getFoundIn = lazy(() => readJson<Record<string, Omit<FoundInConvertible, 'slug'>[]>>('item-found-in.json'));

/** The convertibles (chests, gift baskets…) that an item can come out of. */
export function getConvertiblesContaining(itemId: number): FoundInConvertible[] {
  return (getFoundIn()[String(itemId)] ?? []).map((source) => ({
    ...source,
    slug: source.id ? itemSlugForId(source.id) : undefined,
  }));
}

const getContents = lazy(() => readJson<Record<string, ConvertibleRow[]>>('convertible-contents.json'));

/** What a convertible opens into, best odds first, with reward pages linked. */
export function getConvertibleContents(itemId: number): ConvertibleRow[] {
  return (getContents()[String(itemId)] ?? []).map((row) => ({
    ...row,
    slug: itemSlugForId(row.id),
  }));
}

const getDrops = lazy(() => readJson<Record<string, ItemDropper[]>>('item-drops.json'));

/** The mice that drop a given item (from MHCT), one row each, best first. */
export function getItemDrops(itemId: number): ItemDropper[] {
  return getDrops()[String(itemId)] ?? [];
}

const getLoot = lazy(() => readJson<Record<string, LocationLootRow[]>>('location-loot.json'));

/**
 * Everything MHCT has seen drop at a location, best rate first, each with the
 * mouse most likely to drop it there.
 */
export function getLocationLoot(locationName: string): LocationLootRow[] {
  return getLoot()[locationName.toLowerCase()] ?? [];
}

/**
 * Items the game associates with an environment. The `environment` field is
 * only set on a handful of items (mostly map pieces); the location tags on
 * cheese, potions, and gear carry the rest.
 */
export function getItemsForEnvironment(environmentId: string): GameItem[] {
  return getItems().filter(
    (item) => (item.environment ?? []).includes(environmentId) || (item.tags ?? []).includes(environmentId),
  );
}

const getAttraction = lazy(() => readJson<Record<string, AttractionRow[]>>('mice-attraction.json'));

/** Where a mouse is attracted and how often, best rate first (from MHCT and MH-Tools). */
export function getMouseAttraction(mouseId: number): AttractionRow[] {
  return getAttraction()[String(mouseId)] ?? [];
}

const getMouseMapRows = lazy(() => readJson<Record<string, MouseMapRow[]>>('mouse-maps.json'));

/** The treasure maps a mouse can turn up on (from MHCT). */
export function getMouseMaps(mouseId: number): MouseMapRow[] {
  return getMouseMapRows()[String(mouseId)] ?? [];
}
